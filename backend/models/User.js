const mongoose = require('mongoose');

const commitHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  repository: { type: String, required: true },
  message: { type: String, required: true },
  commitId: { type: String },
  branch: { type: String, default: 'main' }
});

const repositoryStatsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  commitCount: { type: Number, default: 0 },
  lastCommitAt: { type: Date }
});

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  totalCommits: { type: Number, default: 0 },
  commits: [commitHistorySchema],
  repositories: [repositoryStatsSchema],
  lastUpdated: { type: Date, default: Date.now },
  avatarUrl: { type: String },
  installationId: { type: String },
  installations: [{
    installationId: { type: String, required: true },
    repositoryIds: [{ type: String }]
  }],
}, {
  timestamps: true
});

userSchema.index({ githubId: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'commits.timestamp': -1 });

userSchema.methods.addCommits = function(newCommits) {
  const uniqueCommits = newCommits.filter(newCommit => {
    return !this.commits.some(existingCommit => 
      existingCommit.commitId === newCommit.commitId
    );
  });

  if (uniqueCommits.length > 0) {
    this.commits.push(...uniqueCommits);
    this.totalCommits += uniqueCommits.length;
    this.lastUpdated = new Date();
  }

  return uniqueCommits.length;
};

userSchema.methods.getRecentCommits = function(minutes = 20) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  return this.commits.filter(commit => commit.timestamp >= cutoff);
};

userSchema.methods.updateRepositoryStats = function(repoFullName) {
  const repoStats = this.repositories.find(r => r.fullName === repoFullName);
  if (repoStats) {
    repoStats.commitCount++;
    repoStats.lastCommitAt = new Date();
  } else {
    const [owner, name] = repoFullName.split('/');
    this.repositories.push({
      name,
      fullName: repoFullName,
      commitCount: 1,
      lastCommitAt: new Date()
    });
  }
};

userSchema.methods.getCommitIntensity = function(minutes = 5) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  const recentCommits = this.commits.filter(commit => commit.timestamp >= cutoff);
  return Math.min(100, (recentCommits.length / 5) * 100);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 