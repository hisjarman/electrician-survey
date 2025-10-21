
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DATA_DIR = path.join(__dirname, "data");
const RESPONSES_PATH = path.join(DATA_DIR, "responses.json");

// Ensure data file exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(RESPONSES_PATH)) fs.writeFileSync(RESPONSES_PATH, JSON.stringify([] , null, 2));

function loadResponses() {
  try {
    const raw = fs.readFileSync(RESPONSES_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading responses.json", e);
    return [];
  }
}

function saveResponses(data) {
  fs.writeFileSync(RESPONSES_PATH, JSON.stringify(data, null, 2));
}

app.get("/", (req, res) => {
  res.render("form");
});

app.post("/submit", (req, res) => {
  const body = req.body;

  // Normalize checkbox arrays
  const barriers = Array.isArray(body.barriers) ? body.barriers : (body.barriers ? [body.barriers] : []);

  const record = {
    timestamp: new Date().toISOString(),
    companySize: body.companySize || "",
    state: body.state || "",
    usesRebates: body.usesRebates || "",
    avgProjectSize: body.avgProjectSize || "",
    barriers: barriers,
    whoFiles: body.whoFiles || "",
    findRebates: body.findRebates || "",
    email: body.email || ""
  };

  const responses = loadResponses();
  responses.push(record);
  saveResponses(responses);

  res.render("thanks", { record });
});

// Admin-ish view of raw responses (no auth; keep the URL private when sharing)
app.get("/admin", (req, res) => {
  const responses = loadResponses();
  res.render("admin", { responses });
});

// Dashboard with simple aggregations
app.get("/dashboard", (req, res) => {
  const responses = loadResponses();

  // Aggregations
  const uses = { Yes: 0, Sometimes: 0, No: 0 };
  const barriersCount = {};
  const byState = {};
  const whoFilesCount = {};
  const avgProjectBuckets = {
    "Under $5k": 0, "$5k–$25k": 0, "$25k–$100k": 0, "Over $100k": 0
  };

  responses.forEach(r => {
    // usesRebates
    if (uses[r.usesRebates] !== undefined) uses[r.usesRebates]++;
    // barriers
    (r.barriers || []).forEach(b => barriersCount[b] = (barriersCount[b] || 0) + 1);
    // state
    if (r.state) byState[r.state] = (byState[r.state] || 0) + 1;
    // whoFiles
    if (r.whoFiles) whoFilesCount[r.whoFiles] = (whoFilesCount[r.whoFiles] || 0) + 1;
    // avg project size
    if (avgProjectBuckets[r.avgProjectSize] !== undefined) avgProjectBuckets[r.avgProjectSize]++;
  });

  res.render("dashboard", {
    total: responses.length,
    uses,
    barriersCount,
    byState,
    whoFilesCount,
    avgProjectBuckets
  });
});

// Export CSV
app.get("/export.csv", (req, res) => {
  const responses = loadResponses();
  const headers = ["timestamp","companySize","state","usesRebates","avgProjectSize","barriers","whoFiles","findRebates","email"];
  const lines = [headers.join(",")];
  responses.forEach(r => {
    const row = [
      r.timestamp,
      r.companySize,
      r.state,
      r.usesRebates,
      r.avgProjectSize,
      (r.barriers || []).join("|"),
      r.whoFiles,
      r.findRebates,
      r.email
    ].map(v => `"${String(v).replace(/"/g,'""')}"`);
    lines.push(row.join(","));
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="responses.csv"');
  res.send(lines.join("\n"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
