// ==========================
// Supabase Config
// ==========================
const SUPABASE_URL = "https://ojskxzgbmgwspmswyony.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qc2t4emdibWd3c3Btc3d5b255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5Nzc1NDcsImV4cCI6MjA3MjU1MzU0N30.glFY56Wkw-zwTb63reXMl1bifc6QYKLM543Rljt2LH8";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================
// State
// ==========================
let categories = [];
let subCategories = [];
let products = [];
let materials = [];
let partNumberData = [];

// ==========================
// Clock
// ==========================
function updateJakartaClock() {
  const now = new Date();
  document.getElementById("jakarta-time").textContent =
    now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" });
  document.getElementById("jakarta-date").textContent =
    now.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
}
setInterval(updateJakartaClock, 1000);

// ==========================
// Load Master Data
// ==========================
async function loadMasterData() {
  const { data: cat, error: catErr } = await supabase.from("categories").select("*").order("code");
  const { data: sub, error: subErr } = await supabase.from("sub_categories").select("*").order("code");
  const { data: prod, error: prodErr } = await supabase.from("products").select("*").order("code");
  const { data: mat, error: matErr } = await supabase.from("materials").select("*").order("code");

  if (catErr || subErr || prodErr || matErr) {
    console.error("Error loading data:", catErr, subErr, prodErr, matErr);
    return;
  }

  categories = cat || [];
  subCategories = sub || [];
  products = prod || [];
  materials = mat || [];

  populateCategories();
}

// ==========================
// Dropdown Populate
// ==========================
function populateCategories() {
  const select = document.getElementById("category");
  select.innerHTML = `<option value="">-- Pilih Kategori --</option>`;
  categories.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.code}. ${c.name}`;
    select.appendChild(opt);
  });
}

function updateSubCategories() {
  const categoryId = document.getElementById("category").value;
  const select = document.getElementById("subCategory");
  select.disabled = false;
  select.innerHTML = `<option value="">-- Pilih Sub Kategori --</option>`;
  subCategories.filter(s => s.category_id == categoryId).forEach(sc => {
    const opt = document.createElement("option");
    opt.value = sc.id;
    opt.textContent = `${sc.code}. ${sc.name}`;
    select.appendChild(opt);
  });
}

function updateProducts() {
  const subCategoryId = document.getElementById("subCategory").value;
  const select = document.getElementById("productName");
  select.disabled = false;
  select.innerHTML = `<option value="">-- Pilih Produk --</option>`;
  products.filter(p => p.sub_category_id == subCategoryId).forEach(pr => {
    const opt = document.createElement("option");
    opt.value = pr.id;
    opt.textContent = `${pr.code}. ${pr.name}`;
    select.appendChild(opt);
  });
}

function updateMaterials() {
  const subCategoryId = document.getElementById("subCategory").value;
  const select = document.getElementById("material");
  select.disabled = false;
  select.innerHTML = `<option value="">-- Pilih Material --</option>`;
  materials.filter(m => m.sub_category_id == subCategoryId).forEach(ma => {
    const opt = document.createElement("option");
    opt.value = ma.id;
    opt.textContent = `${ma.code}. ${ma.name}`;
    select.appendChild(opt);
  });
}

// ==========================
// Size Code
// ==========================
function generateSizeCode() {
  const l = document.getElementById("length").value;
  const w = document.getElementById("width").value;
  const h = document.getElementById("height").value;
  if (l && w && h) {
    document.getElementById("sizeCode").value = `${l}x${w}x${h}`;
  }
}

// ==========================
// Part Number
// ==========================
async function generatePartNumber() {
  const categoryId = document.getElementById("category").value;
  const subCategoryId = document.getElementById("subCategory").value;
  const productId = document.getElementById("productName").value;
  const materialId = document.getElementById("material").value;
  const size = document.getElementById("sizeCode").value;
  const price = document.getElementById("price").value;

  if (!categoryId || !subCategoryId || !productId || !materialId || !size) {
    alert("Lengkapi semua field!");
    return;
  }

  const { data, error } = await supabase.from("part_numbers").insert([
    { category_id: categoryId, sub_category_id: subCategoryId, product_id: productId, material_id: materialId, size, price }
  ]).select();

  if (error) {
    console.error("Insert error:", error);
    alert("Gagal menyimpan data.");
    return;
  }

  loadPartNumbers();

  document.getElementById("result").style.display = "block";
  document.getElementById("partNumber").value = `PN-${data[0].id}`;
  document.getElementById("qrData").value = `PN-${data[0].id}`;
  const qr = document.getElementById("qr-code");
  qr.innerHTML = "";
  new QRCode(qr, { text: `PN-${data[0].id}`, width: 150, height: 150 });
}

async function loadPartNumbers() {
  const { data, error } = await supabase
    .from("part_numbers")
    .select(`
      id, size, price,
      categories (name),
      sub_categories (name),
      products (name),
      materials (name)
    `)
    .order("id", { ascending: false });

  if (error) {
    console.error("Load error:", error);
    return;
  }
  partNumberData = data;
  updateTable();
}

function updateTable() {
  const body = document.getElementById("tableBody");
  body.innerHTML = "";
  if (partNumberData.length === 0) {
    body.innerHTML = `<tr><td colspan="8">Belum ada data</td></tr>`;
    return;
  }
  partNumberData.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.categories?.name || "-"}</td>
      <td>${item.sub_categories?.name || "-"}</td>
      <td>${item.products?.name || "-"}</td>
      <td>${item.materials?.name || "-"}</td>
      <td>${item.size}</td>
      <td>${item.price || "-"}</td>
      <td><button onclick="deletePN(${item.id})">Delete</button></td>
    `;
    body.appendChild(tr);
  });
}

async function deletePN(id) {
  if (!confirm("Hapus data?")) return;
  await supabase.from("part_numbers").delete().eq("id", id);
  loadPartNumbers();
}

// ==========================
// Login
// ==========================
function validateLogin() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  if (u === "Farrindo" && p === "Farrindo365") {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    return false;
  }
  document.getElementById("loginError").style.display = "block";
  return false;
}

// ==========================
// Init
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  updateJakartaClock();
  await loadMasterData();
  await loadPartNumbers();
});


