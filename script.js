// ==========================
// Supabase Config
// ==========================
const SUPABASE_URL = "https://ojskxzgbmgwspmswyony.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qc2t4emdibWd3c3d5b255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5Nzc1NDcsImV4cCI6MjA3MjU1MzU0N30.glFY56Wkw-zwTb63reXMl1bifc6QYKLM543Rljt2LH8";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================
// State Variables
// ==========================
let categories = [];
let subCategories = [];
let products = [];
let materials = [];
let partNumberData = [];

// ==========================
// Clock (Jakarta)
// ==========================
function updateJakartaClock() {
  const now = new Date();
  document.getElementById("jakarta-time").textContent = now.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  document.getElementById("jakarta-date").textContent = now.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
setInterval(updateJakartaClock, 1000);
updateJakartaClock();

// ==========================
// Load Data from Supabase
// ==========================
async function loadMasterData() {
  const { data: cat } = await supabase.from("categories").select("*").order("code", { ascending: true });
  const { data: sub } = await supabase.from("sub_categories").select("*").order("code", { ascending: true });
  const { data: prod } = await supabase.from("products").select("*").order("code", { ascending: true });
  const { data: mat } = await supabase.from("materials").select("*").order("id", { ascending: true });

  categories = cat || [];
  subCategories = sub || [];
  products = prod || [];
  materials = mat || [];

  populateCategoryDropdown();
}

async function loadPartNumbers() {
  const { data, error } = await supabase
    .from("part_numbers")
    .select(`
      id, size, price, details, qr_data, created_at,
      categories (id, code, name),
      sub_categories (id, code, name),
      products (id, code, name),
      materials (id, code, name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load Part Numbers Error:", error);
    return;
  }
  partNumberData = data;
  updateDataTable();
}

// ==========================
// Populate Dropdowns
// ==========================
function populateCategoryDropdown() {
  const select = document.getElementById("category");
  select.innerHTML = `<option value="">-- Pilih Kategori --</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = `${cat.code}. ${cat.name}`;
    select.appendChild(opt);
  });
}

function updateSubCategories() {
  const categoryId = document.getElementById("category").value;
  const select = document.getElementById("subCategory");
  select.innerHTML = `<option value="">-- Pilih Sub Kategori --</option>`;
  subCategories.filter(s => s.category_id == categoryId).forEach(sc => {
    const opt = document.createElement("option");
    opt.value = sc.id;
    opt.textContent = `${sc.code}. ${sc.name}`;
    select.appendChild(opt);
  });
  document.getElementById("productName").innerHTML = `<option value="">-- Pilih Produk --</option>`;
  document.getElementById("material").innerHTML = `<option value="">-- Pilih Material --</option>`;
}

function updateProducts() {
  const subCategoryId = document.getElementById("subCategory").value;
  const select = document.getElementById("productName");
  select.innerHTML = `<option value="">-- Pilih Produk --</option>`;
  products.filter(p => p.sub_category_id == subCategoryId).forEach(pr => {
    const opt = document.createElement("option");
    opt.value = pr.id;
    opt.textContent = `${pr.code}. ${pr.name}`;
    select.appendChild(opt);
  });
  document.getElementById("material").innerHTML = `<option value="">-- Pilih Material --</option>`;
}

function updateMaterials() {
  const subCategoryId = document.getElementById("subCategory").value;
  const select = document.getElementById("material");
  select.innerHTML = `<option value="">-- Pilih Material --</option>`;
  materials.filter(m => m.sub_category_id == subCategoryId).forEach(ma => {
    const opt = document.createElement("option");
    opt.value = ma.id;
    opt.textContent = ma.name;
    select.appendChild(opt);
  });
}

// ==========================
// Save Part Number
// ==========================
async function generatePartNumber() {
  const categoryId = document.getElementById("category").value;
  const subCategoryId = document.getElementById("subCategory").value;
  const productId = document.getElementById("productName").value;
  const materialId = document.getElementById("material").value;
  const size = document.getElementById("sizeCode").value || document.getElementById("cartridgeSizeCode").value;
  const price = document.getElementById("price").value;

  if (!categoryId || !subCategoryId || !productId || !materialId || !size) {
    alert("Lengkapi semua field!");
    return;
  }

  const category = categories.find(c => c.id == categoryId);
  const subCategory = subCategories.find(sc => sc.id == subCategoryId);
  const product = products.find(p => p.id == productId);
  const material = materials.find(m => m.id == materialId);

  const qrData = `Category: ${category.name}\nSub Category: ${subCategory.name}\nProduct: ${product.name}\nMaterial: ${material.name}\nSize: ${size}\nPrice: ${price}`;

  const { data, error } = await supabase.from("part_numbers").insert([
    {
      category_id: categoryId,
      sub_category_id: subCategoryId,
      product_id: productId,
      material_id: materialId,
      size,
      price,
      details: "",
      qr_data: qrData
    }
  ]).select();

  if (error) {
    console.error("Insert Error:", error);
    alert("Gagal menyimpan data.");
    return;
  }

  await loadPartNumbers();

  document.getElementById("result").style.display = "block";
  document.getElementById("partNumber").value = `PN-${data[0].id}`;
  document.getElementById("qrData").value = qrData;

  const qrContainer = document.getElementById("qr-code");
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, { text: qrData, width: 200, height: 200 });
  document.getElementById("qr-text").textContent = qrData;
}

// ==========================
// Table UI
// ==========================
function updateDataTable() {
  const tableBody = document.querySelector(".data-table tbody");
  tableBody.innerHTML = "";

  if (partNumberData.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="no-data">Belum ada data</td></tr>`;
    return;
  }

  partNumberData.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.categories.name}</td>
      <td>${item.sub_categories.name}</td>
      <td>${item.products.name}</td>
      <td>${item.materials.name}</td>
      <td>${item.size}</td>
      <td>${item.price || "-"}</td>
      <td>
        <button class="action-btn delete-btn" onclick="handleDelete(${item.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function handleDelete(id) {
  if (confirm("Hapus data ini?")) {
    await supabase.from("part_numbers").delete().eq("id", id);
    await loadPartNumbers();
  }
}

// ==========================
// Login
// ==========================
function validateLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorElement = document.getElementById("loginError");
  if (username === "Farrindo" && password === "Farrindo365") {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    return false;
  } else {
    errorElement.style.display = "block";
    return false;
  }
}

// ==========================
// Init Page
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("loginModal").style.display = "block";
  await loadMasterData();
  await loadPartNumbers();
});
