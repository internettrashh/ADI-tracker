require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const moment = require('moment');
const axios = require('axios');
const crypto = require('crypto');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true
  }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/commit-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
console.log('connected to mongodb');



// Add these helper functions at the top of your file
async function createJWT() {
  const privateKeyPath = path.join(__dirname, 'Adidemooo0 Private Key Apr 21 2025.pem');
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + (10 * 60), // JWT expires in 10 minutes
    iss: process.env.GITHUB_APP_ID
  };
  
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

async function getInstallationToken() {
  const jwt = await createJWT();
  const response = await axios.post(
    `https://api.github.com/app/installations/${process.env.GITHUB_INSTALLATION_ID}/access_tokens`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );
  return response.data.token;
}

// Add helper function to check installation status
async function checkInstallationStatus(token) {
  try {
    const response = await axios.get('https://api.github.com/user/installations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    // Check if our app is in the list of installations
    const ourAppInstallation = response.data.installations.find(
      installation => installation.app_id === process.env.GITHUB_APP_ID
    );
    
    return ourAppInstallation ? ourAppInstallation.id : null;
  } catch (error) {
    console.error('Error checking installation status:', error);
    return null;
  }
}

// Add this helper function to check if the app is installed for a user
async function checkUserInstallations(accessToken) {
  try {
    const response = await axios.get('https://api.github.com/user/installations', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    // Check if our app is in the list of installations
    const ourAppInstallation = response.data.installations.find(
      installation => installation.app_id === parseInt(process.env.GITHUB_APP_ID)
    );
    
    return ourAppInstallation;
  } catch (error) {
    console.error('Error checking user installations:', error);
    return null;
  }
}

// Add this improved helper function to check installations
async function checkGitHubAppInstallation(accessToken) {
    try {
        // First get the authenticated user's information
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        // Then get their installations
        const installationsResponse = await axios.get('https://api.github.com/user/installations', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        // Find our app in their installations
        const ourAppInstallation = installationsResponse.data.installations.find(
            installation => installation.app_id === parseInt(process.env.GITHUB_APP_ID)
        );

        if (ourAppInstallation) {
            return {
                installed: true,
                installationId: ourAppInstallation.id,
                user: userResponse.data
            };
        }

        return {
            installed: false,
            user: userResponse.data
        };
    } catch (error) {
        console.error('Error checking installation:', error);
        throw error;
    }
}

// Update the auth route to handle the initial GitHub OAuth
app.get('/auth/github', async (req, res) => {
    try {
        // Generate state for security
        const state = crypto.randomBytes(16).toString('hex');
        req.session.oauthState = state;

        // First, authenticate with GitHub OAuth
        const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
        githubAuthUrl.searchParams.append('client_id', process.env.GITHUB_CLIENT_ID);
        githubAuthUrl.searchParams.append('scope', 'read:user,user:email');
        githubAuthUrl.searchParams.append('state', state);
        githubAuthUrl.searchParams.append('redirect_uri', `${process.env.BACKEND_URL}/auth/github/oauth-callback`);
        
        res.redirect(githubAuthUrl.toString());
    } catch (error) {
        console.error('Auth error:', error);
        res.redirect(`${process.env.APP_URL}/login?error=auth_failed`);
    }
});

// Handle the OAuth callback
app.get('/auth/github/oauth-callback', async (req, res) => {
    try {
        const { code, state } = req.query;

        if (state !== req.session.oauthState) {
            throw new Error('State mismatch');
        }

        // Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: `${process.env.BACKEND_URL}/auth/github/oauth-callback`
        }, {
            headers: { Accept: 'application/json' }
        });

        const accessToken = tokenResponse.data.access_token;

        // Check GitHub App installation status
        const installationStatus = await checkGitHubAppInstallation(accessToken);
        
        // Store token and user info in session
        req.session.githubToken = accessToken;
        req.session.githubUser = installationStatus.user;

        // Create or update user in database
        let user = await User.findOne({ githubId: installationStatus.user.id.toString() });
        if (!user) {
            user = new User({
                githubId: installationStatus.user.id.toString(),
                username: installationStatus.user.login,
                avatarUrl: installationStatus.user.avatar_url,
            });
        }

        if (installationStatus.installed) {
            user.installationId = installationStatus.installationId;
            await user.save();

            req.session.user = {
                id: user._id,
                githubId: user.githubId,
                username: user.username,
                installationId: installationStatus.installationId
            };

            res.redirect(`${process.env.APP_URL}/dashboard`);
        } else {
            await user.save();
            // If app is not installed, redirect to installation flow
            res.redirect(`${process.env.APP_URL}/callback?needsInstallation=true`);
        }
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.APP_URL}/login?error=auth_failed`);
    }
});

// Add a new route to handle app installation
app.get('/auth/install-app', (req, res) => {
    if (!req.session.githubUser) {
        res.redirect('/auth/github');
        return;
    }
    
    const installUrl = `https://github.com/apps/${process.env.GITHUB_APP_NAME}/installations/new`;
    res.redirect(installUrl);
});

// Add installation callback handler
app.get('/auth/github/installation-callback', async (req, res) => {
    try {
        const { installation_id } = req.query;
        
        if (!req.session.user || !req.session.githubToken) {
            throw new Error('No user session');
        }

        // Verify the installation
        const installationStatus = await checkGitHubAppInstallation(req.session.githubToken);
        
        if (!installationStatus.installed) {
            throw new Error('Installation verification failed');
        }

        // Update user with installation ID
        const user = await User.findById(req.session.user.id);
        if (!user) {
            throw new Error('User not found');
        }

        user.installationId = installation_id;
        await user.save();

        req.session.user = {
            id: user._id,
            githubId: user.githubId,
            username: user.username,
            installationId: installation_id
        };

        res.redirect(`${process.env.APP_URL}/dashboard`);
    } catch (error) {
        console.error('Installation callback error:', error);
        res.redirect(`${process.env.APP_URL}/login?error=installation_failed`);
    }
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Auth status endpoint
app.get('/auth/status', (req, res) => {
  if (req.session.user) {
    res.json({ 
      authenticated: true, 
      user: req.session.user 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout endpoint
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Protected route example
app.get('/api/user', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Existing webhook endpoint
app.post('/webhook', async (req, res) => {
    console.log('Webhook received');
    
    try {
        if (req.headers['x-github-event'] === 'push') {
            const payload = req.body;
            const sender = payload.sender;
            const commits = payload.commits || [];
            const repository = payload.repository;

            if (!sender || !repository) {
                return res.status(400).json({ error: 'Invalid webhook payload' });
            }

            let user = await User.findOne({ githubId: sender.id.toString() });
            
            if (!user) {
                user = new User({
                    githubId: sender.id.toString(),
                    username: sender.login,
                    totalCommits: 0,
                    commits: [],
                    repositories: []
                });
            }

            // Process commits and update repository stats
            const newCommits = commits.map(commit => ({
                timestamp: new Date(commit.timestamp),
                repository: repository.full_name,
                message: commit.message,
                commitId: commit.id
            }));

            if (newCommits.length > 0) {
                user.commits.push(...newCommits);
                user.totalCommits += newCommits.length;
                user.updateRepositoryStats(repository.full_name);
                user.lastUpdated = new Date();
                
                await user.save();
                console.log(`Processed ${newCommits.length} commits for user ${user.username}`);
            }

            res.status(200).json({ 
                message: 'Webhook processed successfully',
                commitsProcessed: newCommits.length
            });
        } else {
            res.status(200).json({ message: 'Event type not handled' });
        }
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get users sorted by commit count
app.get('/users/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ totalCommits: -1 })
      .select('username totalCommits');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get commit intensity for a user
app.get('/users/:githubId/intensity', async (req, res) => {
  try {
    const user = await User.findOne({ githubId: req.params.githubId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const twentyMinsAgo = moment().subtract(20, 'minutes');
    const recentCommits = user.commits.filter(commit => 
      moment(commit.timestamp).isAfter(twentyMinsAgo)
    );

    // Calculate intensity (0-100)
    const intensity = Math.min(100, (recentCommits.length / 5) * 100);

    res.json({
      username: user.username,
      intensity,
      recentCommitsCount: recentCommits.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats - completely public endpoint
app.get('/api/user/stats', async (req, res) => {
    try {
        // Get total hackers (users with at least one commit)
        const totalHackers = await User.countDocuments({
            'commits.0': { $exists: true }
        });
        
        // Get total commits across all users using aggregation
        const totalCommitsAggregation = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalCommits: { $sum: { $size: "$commits" } }
                }
            }
        ]);
        
        // Get unique repositories across all users
        const uniqueReposAggregation = await User.aggregate([
            { $unwind: '$commits' },
            { $group: { 
                _id: null,
                repositories: { $addToSet: '$commits.repository' }
            }},
            { $project: {
                totalProjects: { $size: '$repositories' }
            }}
        ]);

        res.json({
            totalCommits: totalCommitsAggregation[0]?.totalCommits || 0,
            totalProjects: uniqueReposAggregation[0]?.totalProjects || 0,
            totalHackers: totalHackers || 0
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get enhanced leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaders = await User.find({
            'commits.0': { $exists: true } // Only users with commits
        })
        .select('username totalCommits avatarUrl')
        .sort({ totalCommits: -1 })
        .limit(7);

        res.json(leaders.map(user => ({
            username: user.username,
            totalCommits: user.totalCommits || 0,
            avatarUrl: user.avatarUrl
        })));
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Add this new endpoint to check GitHub App installation
app.get('/auth/check-installation', async (req, res) => {
  try {
    if (!req.session.user || !req.session.githubToken) {
      return res.json({ 
        authenticated: false,
        hasGitHubApp: false 
      });
    }

    // Use the GitHub token to check installations
    const installationStatus = await checkGitHubAppInstallation(req.session.githubToken);
    
    res.json({
      authenticated: true,
      hasGitHubApp: installationStatus.installed,
      user: {
        username: req.session.user.username,
        avatarUrl: req.session.user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Error checking installation:', error);
    res.status(500).json({ error: 'Failed to check installation status' });
  }
});

// Add a dedicated installation route
app.get('/auth/github/install', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/github');
  }

  const installUrl = new URL('https://github.com/apps/adidemooo0/installations/new');
  res.redirect(installUrl.toString());
});

// Get recent commits endpoint - no auth required
app.get('/api/recent-commits', async (req, res) => {
    try {
        // Get the 5 most recent commits from all users
        const recentCommits = await User.aggregate([
            // Unwind the commits array to work with individual commits
            { $unwind: '$commits' },
            // Sort by timestamp descending
            { $sort: { 'commits.timestamp': -1 } },
            // Limit to 5 most recent
            { $limit: 5 },
            // Shape the output
            {
                $project: {
                    id: '$commits.commitId',
                    message: '$commits.message',
                    author: '$username',
                    repo: '$commits.repository',
                    time: '$commits.timestamp',
                    avatarUrl: '$avatarUrl'
                }
            }
        ]);

        res.json(recentCommits);
    } catch (error) {
        console.error('Recent commits error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch recent commits',
            details: error.message 
        });
    }
});

// Get leaderboard - no auth required
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaders = await User.find({
            'commits.0': { $exists: true } // Only users with commits
        })
        .select('username totalCommits avatarUrl')
        .sort({ totalCommits: -1 })
        .limit(7);

        res.json(leaders.map(user => ({
            username: user.username,
            totalCommits: user.totalCommits || 0,
            avatarUrl: user.avatarUrl
        })));
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Server start
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

