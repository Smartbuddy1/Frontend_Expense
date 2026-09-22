const https = require('https');

https.get('https://api.github.com/repos/Smartbuddy1/IOT/commits?per_page=100', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const commits = JSON.parse(data);
    const emails = new Set();
    commits.forEach(c => {
      if (c.commit && c.commit.author) {
        emails.add(c.commit.author.email);
      }
    });
    console.log(Array.from(emails));
  });
});
