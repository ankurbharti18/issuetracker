const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Dummy data for projects and issues
let projects = [];
let issues = [];

// Routes
app.get('/', (req, res) => {
  res.render('home', { projects });
});

app.get('/projects/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const project = projects.find((p) => p.id == projectId);
  let projectIssues = issues.filter((issue) => issue.projectId == projectId);

  const labels = req.query.labels;
  const author = req.query.author;
  const search = req.query.search;

  if (labels) {
    const labelsToFilter = labels.split(',').map(label => label.trim());
    projectIssues = projectIssues.filter((issue) => labelsToFilter.every(label => issue.labels.includes(label)));
  }

  if (author) {
    projectIssues = projectIssues.filter((issue) => issue.author.toLowerCase().includes(author.toLowerCase()));
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    projectIssues = projectIssues.filter((issue) => searchRegex.test(issue.title) || searchRegex.test(issue.description));
  }

  res.render('project-detail', { project, issues: projectIssues, labels, author, search });
});

app.get('/create-project', (req, res) => {
  res.render('create-project');
});

app.post('/create-project', (req, res) => {
  const { name, description, author } = req.body;
  const newProject = { id: projects.length + 1, name, description, author, labels: [] };
  projects.push(newProject);
  res.redirect('/');
});

app.get('/create-issue', (req, res) => {
  const projectId = req.query.projectId;
  const project = projects.find((p) => p.id == projectId);
  const projectLabels = project ? project.labels : [];
  res.render('create-issue', { projects, projectId, projectLabels });
});

app.post('/create-issue', (req, res) => {
  const { projectId, title, description, labels, author } = req.body;
  const newIssue = { id: issues.length + 1, projectId, title, description, labels, author };
  issues.push(newIssue);
  res.redirect(`/projects/${projectId}`);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:8000`);
});
