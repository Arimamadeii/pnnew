import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// === SETUP SUPABASE ===
const supabaseUrl = "https://zcgflkxqyborzbltroes.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZ2Zsa3hxeWJvcnpibHRyb2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjQxMTgsImV4cCI6MjA3MzEwMDExOH0.66fp8DIVxHyQeRsF0ZyzdzutKTWtn2yWik43-QMhKKI";
const supabase = createClient(supabaseUrl, supabaseKey);

// === ELEMENTS ===
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const currentTime = document.getElementById('currentTime');
const categorySelect = document.getElementById('categorySelect');
const subcategorySelect = document.getElementById('subcategorySelect');
const productSelect = document.getElementById('productSelect');
const mediaSelect = document.getElementById('mediaSelect');
const lengthInput = document.getElementById('lengthInput');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const pocketVOptionContainer = document.getElementById('pocketVOptionContainer');
const headerOptionContainer = document.getElementById('headerOptionContainer');
const pocketVSelect = document.getElementById('pocketVSelect');
const headerSelect = document.getElementById('headerSelect');
const partNumberForm = document.getElementById('partNumberForm');
const partNumberResult = document.getElementById('partNumberResult');
const partNumberDetails = document.getElementById('partNumberDetails');
const recentPartNumbers = document.getElementById('recentPartNumbers');
const loading = document.getElementById('loading');
const qrCode = document.getElementById('qrCode');
const qrCanvas = document.getElementById('qrCanvas');
const downloadQrBtn = document.getElementById('downloadQrBtn');

// Unit converter elements
const mmInput = document.getElementById('mmInput');
const inchInput = document.getElementById('inchInput');
const cmInput = document.getElementById('cmInput');
const resetConverter = document.getElementById('resetConverter');

// Error message elements
const categoryError = document.getElementById('categoryError');
const subcategoryError = document.getElementById('subcategoryError');
const productError = document.getElementById('productError');
const mediaError = document.getElementById('mediaError');
const dimensionError = document.getElementById('dimensionError');

// Modal elements
const modalCategorySelect = document.getElementById('modalCategorySelect');
const modalSubcategorySelect = document.getElementById('modalSubcategorySelect');
const modalMediaSubcategorySelect = document.getElementById('modalMediaSubcategorySelect');
const dimensionProductSelect = document.getElementById('dimensionProductSelect');

// Form input elements
const subcategoryCodeInput = document.getElementById('subcategoryCodeInput');
const subcategoryNameInput = document.getElementById('subcategoryNameInput');
const subcategoryDescriptionInput = document.getElementById('subcategoryDescriptionInput');
const productCodeInput = document.getElementById('productCodeInput');
const productNameInput = document.getElementById('productNameInput');
const productDescriptionInput = document.getElementById('productDescriptionInput');
const mediaCodeInput = document.getElementById('mediaCodeInput');
const mediaNameInput = document.getElementById('mediaNameInput');
const mediaDescriptionInput = document.getElementById('mediaDescriptionInput');

// Save buttons
const saveSubcategoryBtn = document.getElementById('saveSubcategoryBtn');
const saveProductBtn = document.getElementById('saveProductBtn');
const saveMediaBtn = document.getElementById('saveMediaBtn');

// State variables
let currentPartNumber = '';
let dimensionCounter = {}; // Untuk melacak counter dimensi per produk

// === FUNCTIONS ===
function showLoading() {
    loading.style.display = 'block';
}

function hideLoading() {
    loading.style.display = 'none';
}

function clearErrors() {
    categoryError.textContent = '';
    subcategoryError.textContent = '';
    productError.textContent = '';
    mediaError.textContent = '';
    dimensionError.textContent = '';
}

// Update waktu Indonesia (WIB)
function updateTime() {
    const options = { 
        timeZone: 'Asia/Jakarta',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
    };
    const now = new Date().toLocaleString('id-ID', options);
    currentTime.textContent = now;
}

// Unit converter functions
function setupUnitConverter() {
    // MM to other units
    mmInput.addEventListener('input', () => {
        if (mmInput.value) {
            const mm = parseFloat(mmInput.value);
            inchInput.value = (mm / 25.4).toFixed(2);
            cmInput.value = (mm / 10).toFixed(1);
        }
    });

    // Inch to other units
    inchInput.addEventListener('input', () => {
        if (inchInput.value) {
            const inches = parseFloat(inchInput.value);
            mmInput.value = Math.round(inches * 25.4);
            cmInput.value = (inches * 2.54).toFixed(1);
        }
    });

    // CM to other units
    cmInput.addEventListener('input', () => {
        if (cmInput.value) {
            const cm = parseFloat(cmInput.value);
            mmInput.value = Math.round(cm * 10);
            inchInput.value = (cm / 2.54).toFixed(2);
        }
    });

    // Reset converter
    resetConverter.addEventListener('click', () => {
        mmInput.value = '';
        inchInput.value = '';
        cmInput.value = '';
    });
}

// Login function
function setupLogin() {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'Farrindo' && password === 'Farrindo365') {
            loginScreen.style.display = 'none';
            mainApp.style.display = 'block';
            // Load data setelah login berhasil
            loadCategories();
            loadRecentPartNumbers();
            // Update waktu setiap detik
            setInterval(updateTime, 1000);
            updateTime();
        } else {
            alert('Username atau password salah!');
        }
    });

    logoutBtn.addEventListener('click', () => {
        loginScreen.style.display = 'block';
        mainApp.style.display = 'none';
        loginForm.reset();
    });
}

// QR Code functions
function generateQRCode(text) {
    const ctx = qrCanvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    
    // Generate QR code
    QRCode.toCanvas(qrCanvas, text, {
        width: 200,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, (error) => {
        if (error) {
            console.error('QR Code generation error:', error);
        } else {
            qrCode.style.display = 'block';
        }
    });
}

function downloadQRCode() {
    const link = document.createElement('a');
    link.download = `${currentPartNumber}_qrcode.png`;
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
}

// Dimensi code generation
async function generateDimensionCode(productId, length, width, height) {
    try {
        // Cari dimensi yang sudah ada untuk produk ini
        const { data: existingDimensions, error } = await supabase
            .from('dimensions')
            .select('code')
            .eq('product_id', productId)
            .order('code', { ascending: false })
            .limit(1);
        
        if (error) {
            console.error('Error fetching dimensions:', error);
            return `A001`; // Default jika error
        }
        
        if (existingDimensions && existingDimensions.length > 0) {
            // Ambil angka dari kode terakhir (A001 -> 1)
            const lastCode = existingDimensions[0].code;
            const lastNumber = parseInt(lastCode.substring(1)) || 0;
            const nextNumber = lastNumber + 1;
            return `A${nextNumber.toString().padStart(3, '0')}`;
        } else {
            return `A001`; // Default jika belum ada dimensi
        }
    } catch (error) {
        console.error('Error generating dimension code:', error);
        return `A001`; // Default jika error
    }
}

// Load categories function
async function loadCategories() {
    showLoading();
    clearErrors();
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('code');

        if (error) {
            console.error('Supabase error:', error);
            categoryError.textContent = 'Gagal memuat data kategori. Pastikan RLS policy sudah dikonfigurasi dengan benar.';
            throw error;
        }

        categorySelect.innerHTML = '<option value="">Pilih Kategori</option>';
        modalCategorySelect.innerHTML = '<option value="">Pilih Kategori</option>';
        
        data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.code;
            option.textContent = `${category.code} - ${category.name}`;
            categorySelect.appendChild(option.cloneNode(true));
            modalCategorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    } finally {
        hideLoading();
    }
}

// Load subcategories function
async function loadSubcategories(categoryCode) {
    showLoading();
    clearErrors();
    try {
        // First get category ID
        const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('code', categoryCode)
            .single();

        if (categoryError) throw categoryError;

        // Then get subcategories for this category
        const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', categoryData.id)
            .order('code');

        if (error) throw error;

        subcategorySelect.innerHTML = '<option value="">Pilih Subkategori</option>';
        subcategorySelect.disabled = false;
        
        data.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.code;
            option.textContent = `${subcategory.code} - ${subcategory.name}`;
            subcategorySelect.appendChild(option);
        });

        // Reset dependent fields
        productSelect.innerHTML = '<option value="">Pilih Produk</option>';
        productSelect.disabled = true;
        mediaSelect.innerHTML = '<option value="">Pilih Media</option>';
        mediaSelect.disabled = true;
        pocketVOptionContainer.style.display = 'none';
        headerOptionContainer.style.display = 'none';

    } catch (error) {
        console.error('Error loading subcategories:', error);
        subcategoryError.textContent = 'Gagal memuat data subkategori';
    } finally {
        hideLoading();
    }
}

// Load products function
async function loadProducts(subcategoryCode) {
    showLoading();
    clearErrors();
    try {
        // First get subcategory ID
        const categoryCode = categorySelect.value;
        const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('code', categoryCode)
            .single();

        if (categoryError) throw categoryError;

        const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('subcategories')
            .select('id')
            .eq('category_id', categoryData.id)
            .eq('code', subcategoryCode)
            .single();

        if (subcategoryError) throw subcategoryError;

        // Then get products for this subcategory
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('subcategory_id', subcategoryData.id)
            .order('code');

        if (error) throw error;

        productSelect.innerHTML = '<option value="">Pilih Produk</option>';
        productSelect.disabled = false;
        modalSubcategorySelect.innerHTML = '<option value="">Pilih Subkategori</option>';
        modalMediaSubcategorySelect.innerHTML = '<option value="">Pilih Subkategori</option>';
        dimensionProductSelect.innerHTML = '<option value="">Pilih Produk</option>';
        
        data.forEach(product => {
            const option = document.createElement('option');
            option.value = product.code;
            option.textContent = `${product.code} - ${product.name}`;
            option.setAttribute('data-has-pocket', product.has_pocket_v_option);
            option.setAttribute('data-has-header', product.has_header_option);
            productSelect.appendChild(option);

            // Add to dimension product select
            const dimensionOption = option.cloneNode(true);
            dimensionOption.value = product.id;
            dimensionProductSelect.appendChild(dimensionOption);
        });

        // Add all subcategories to modal selects
        const { data: allSubcategories } = await supabase
            .from('subcategories')
            .select('*')
            .order('code');

        allSubcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.id;
            option.textContent = `${subcategory.code} - ${subcategory.name}`;
            modalSubcategorySelect.appendChild(option.cloneNode(true));
            modalMediaSubcategorySelect.appendChild(option.cloneNode(true));
        });

        // Reset dependent fields
        mediaSelect.innerHTML = '<option value="">Pilih Media</option>';
        mediaSelect.disabled = true;
        pocketVOptionContainer.style.display = 'none';
        headerOptionContainer.style.display = 'none';

    } catch (error) {
        console.error('Error loading products:', error);
        productError.textContent = 'Gagal memuat data produk';
    } finally {
        hideLoading();
    }
}

// Load media function
async function loadMedia(subcategoryCode) {
    showLoading();
    clearErrors();
    try {
        // First get subcategory ID
        const categoryCode = categorySelect.value;
        const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('code', categoryCode)
            .single();

        if (categoryError) throw categoryError;

        const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('subcategories')
            .select('id')
            .eq('category_id', categoryData.id)
            .eq('code', subcategoryCode)
            .single();

        if (subcategoryError) throw subcategoryError;

        // Then get media for this subcategory
        const { data, error } = await supabase
            .from('media')
            .select('*')
            .eq('subcategory_id', subcategoryData.id)
            .order('code');

        if (error) throw error;

        mediaSelect.innerHTML = '<option value="">Pilih Media</option>';
        mediaSelect.disabled = false;
        
        data.forEach(media => {
            const option = document.createElement('option');
            option.value = media.code;
            option.textContent = `${media.code} - ${media.name}`;
            mediaSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading media:', error);
        mediaError.textContent = 'Gagal memuat data media';
    } finally {
        hideLoading();
    }
}

// Generate part number function
async function generatePartNumber() {
    showLoading();
    clearErrors();
    try {
        const categoryCode = categorySelect.value;
        const subcategoryCode = subcategorySelect.value;
        const productCode = productSelect.value;
        const mediaCode = mediaSelect.value;
        const length = parseInt(lengthInput.value);
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        const pocketVOption = pocketVSelect.value || null;
        const headerOption = headerSelect.value || null;

        // Validasi input
        if (!categoryCode || !subcategoryCode || !productCode || !mediaCode || 
            !length || !width || !height) {
            throw new Error('Semua field harus diisi');
        }

        // Manual implementation instead of RPC call
        const partNumber = await manualGeneratePartNumber(
            categoryCode, 
            subcategoryCode, 
            productCode, 
            mediaCode, 
            length,
            width,
            height,
            pocketVOption,
            headerOption
        );

        // Display the result
        partNumberResult.textContent = partNumber;
        currentPartNumber = partNumber;
        
        // Generate QR Code
        generateQRCode(partNumber);
        
        // Show details
        await loadPartNumberDetails(partNumber);
        
        // Refresh recent part numbers
        await loadRecentPartNumbers();

        alert(`Part Number berhasil dibuat: ${partNumber}`);

    } catch (error) {
        console.error('Error generating part number:', error);
        alert('Gagal membuat part number: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Manual generate part number function
async function manualGeneratePartNumber(
    categoryCode, 
    subcategoryCode, 
    productCode, 
    mediaCode, 
    length,
    width,
    height,
    pocketVOption,
    headerOption
) {
    // Construct part number manually
    const partNumber = `${categoryCode}${subcategoryCode}${productCode}-${mediaCode}`;
    
    try {
        // Get all required IDs
        const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('code', categoryCode)
            .single();

        if (categoryError) throw categoryError;

        const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('subcategories')
            .select('id')
            .eq('category_id', categoryData.id)
            .eq('code', subcategoryCode)
            .single();

        if (subcategoryError) throw subcategoryError;

        const { data: productData, error: productError } = await supabase
            .from('products')
            .select('id')
            .eq('subcategory_id', subcategoryData.id)
            .eq('code', productCode)
            .single();

        if (productError) throw productError;

        const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .select('id')
            .eq('subcategory_id', subcategoryData.id)
            .eq('code', mediaCode)
            .single();

        if (mediaError) throw mediaError;

        // Generate dimension code
        const dimensionCode = await generateDimensionCode(productData.id, length, width, height);

        // Insert dimension first
        const { data: dimensionData, error: dimensionError } = await supabase
            .from('dimensions')
            .insert({
                product_id: productData.id,
                code: dimensionCode,
                length_mm: length,
                width_mm: width,
                height_mm: height,
                description: `Dimensi: ${length}x${width}x${height}mm`
            })
            .select()
            .single();

        if (dimensionError) throw dimensionError;

        // Insert into part_numbers table
        const { data, error } = await supabase
            .from('part_numbers')
            .insert({
                part_number: partNumber + dimensionCode,
                category_id: categoryData.id,
                subcategory_id: subcategoryData.id,
                product_id: productData.id,
                media_id: mediaData.id,
                dimension_id: dimensionData.id,
                pocket_v_option: pocketVOption,
                header_option: headerOption
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw new Error('Gagal menyimpan part number. Pastikan RLS policy sudah dikonfigurasi dengan benar.');
        }

        return partNumber + dimensionCode;
    } catch (error) {
        console.error('Error in manualGeneratePartNumber:', error);
        throw error;
    }
}

// Load part number details function
async function loadPartNumberDetails(partNumber) {
    try {
        // Use the part_number_details view
        const { data, error } = await supabase
            .from('part_number_details')
            .select('*')
            .eq('part_number', partNumber)
            .single();

        if (error) {
            console.error('Error loading from part_number_details view:', error);
            
            // Fallback: try to get data from individual tables
            await loadPartNumberDetailsFallback(partNumber);
            return;
        }

        if (data) {
            displayPartNumberDetails(data);
        }
    } catch (error) {
        console.error('Error loading part number details:', error);
        partNumberDetails.innerHTML = '<div class="text-danger">Gagal memuat detail part number</div>';
    }
}

// Fallback for part number details
async function loadPartNumberDetailsFallback(partNumber) {
    try {
        // Extract components from part number
        const categoryCode = partNumber.substring(0, 2);
        const subcategoryCode = partNumber.substring(2, 4);
        const productCode = partNumber.substring(4, 6);
        const mediaCode = partNumber.substring(7, 9);
        const dimensionCode = partNumber.substring(9);
        
        // Get data from individual tables
        const [{ data: categoryData }, { data: subcategoryData }, { data: productData }, 
               { data: mediaData }, { data: dimensionData }, { data: partNumberData }] = await Promise.all([
            supabase.from('categories').select('*').eq('code', categoryCode).single(),
            supabase.from('subcategories').select('*').eq('code', subcategoryCode).single(),
            supabase.from('products').select('*').eq('code', productCode).single(),
            supabase.from('media').select('*').eq('code', mediaCode).single(),
            supabase.from('dimensions').select('*').eq('code', dimensionCode).single(),
            supabase.from('part_numbers').select('*').eq('part_number', partNumber).single()
        ]);

        // Construct details object manually
        const details = {
            part_number: partNumber,
            category_code: categoryData?.code,
            category_name: categoryData?.name,
            subcategory_code: subcategoryData?.code,
            subcategory_name: subcategoryData?.name,
            product_code: productData?.code,
            product_name: productData?.name,
            media_code: mediaData?.code,
            media_name: mediaData?.name,
            dimension_code: dimensionData?.code,
            length_mm: dimensionData?.length_mm,
            width_mm: dimensionData?.width_mm,
            height_mm: dimensionData?.height_mm,
            pocket_v_option: partNumberData?.pocket_v_option,
            header_option: partNumberData?.header_option
        };

        displayPartNumberDetails(details);
    } catch (error) {
        console.error('Error in fallback part number details:', error);
        partNumberDetails.innerHTML = '<div class="text-danger">Gagal memuat detail part number</div>';
    }
}

// Display part number details
function displayPartNumberDetails(data) {
    let detailsHtml = `
        <div class="text-start">
            <small>
                <strong>Kategori:</strong> ${data.category_code} - ${data.category_name}<br>
                <strong>Subkategori:</strong> ${data.subcategory_code} - ${data.subcategory_name}<br>
                <strong>Produk:</strong> ${data.product_code} - ${data.product_name}<br>
                <strong>Media:</strong> ${data.media_code} - ${data.media_name}<br>
        `;
    
    if (data.dimension_code) {
        detailsHtml += `<strong>Dimensi:</strong> ${data.dimension_code}`;
        if (data.length_mm && data.width_mm && data.height_mm) {
            detailsHtml += ` (${data.length_mm}x${data.width_mm}x${data.height_mm}mm)`;
        }
        detailsHtml += `<br>`;
    }
    
    if (data.pocket_v_option) {
        detailsHtml += `<strong>Pocket/V:</strong> ${data.pocket_v_option}<br>`;
    }
    
    if (data.header_option) {
        detailsHtml += `<strong>Header:</strong> ${data.header_option}<br>`;
    }
    
    detailsHtml += `</small></div>`;
    
    partNumberDetails.innerHTML = detailsHtml;
}

// Load recent part numbers
async function loadRecentPartNumbers() {
    try {
        // Try to use the view first
        const { data, error } = await supabase
            .from('part_number_details')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error loading from part_number_details view:', error);
            
            // Fallback: get from part_numbers table and join manually
            await loadRecentPartNumbersFallback();
            return;
        }

        if (data && data.length > 0) {
            displayRecentPartNumbers(data);
        } else {
            recentPartNumbers.innerHTML = '<p class="text-muted">Belum ada part number</p>';
        }
    } catch (error) {
        console.error('Error loading recent part numbers:', error);
        recentPartNumbers.innerHTML = '<p class="text-danger">Gagal memuat part number terbaru</p>';
    }
}

// Fallback for recent part numbers
async function loadRecentPartNumbersFallback() {
    try {
        const { data: partNumbers, error } = await supabase
            .from('part_numbers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        if (partNumbers && partNumbers.length > 0) {
            // Get additional details for each part number
            const detailedPartNumbers = await Promise.all(
                partNumbers.map(async (pn) => {
                    const [{ data: category }, { data: subcategory }, { data: product }] = await Promise.all([
                        supabase.from('categories').select('name').eq('id', pn.category_id).single(),
                        supabase.from('subcategories').select('name').eq('id', pn.subcategory_id).single(),
                        supabase.from('products').select('name').eq('id', pn.product_id).single()
                    ]);
                    
                    return {
                        part_number: pn.part_number,
                        product_name: product?.name || 'Unknown',
                        created_at: pn.created_at
                    };
                })
            );
            
            displayRecentPartNumbers(detailedPartNumbers);
        } else {
            recentPartNumbers.innerHTML = '<p class="text-muted">Belum ada part number</p>';
        }
    } catch (error) {
        console.error('Error in fallback recent part numbers:', error);
        recentPartNumbers.innerHTML = '<p class="text-danger">Gagal memuat part number terbaru</p>';
    }
}

// Display recent part numbers
function displayRecentPartNumbers(data) {
    let html = '<div class="list-group">';
    data.forEach(item => {
        html += `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${item.part_number}</h6>
                    <small>${new Date(item.created_at).toLocaleDateString()}</small>
                </div>
                <small class="text-muted">${item.product_name}</small>
            </div>
        `;
    });
    html += '</div>';
    recentPartNumbers.innerHTML = html;
}

// Save subcategory function
async function saveSubcategory() {
    try {
        const categoryCode = modalCategorySelect.value;
        const code = subcategoryCodeInput.value;
        const name = subcategoryNameInput.value;
        const description = subcategoryDescriptionInput.value;

        if (!categoryCode || !code || !name) {
            alert('Harap isi semua field yang wajib diisi');
            return;
        }

        // Get category ID
        const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('code', categoryCode)
            .single();

        if (categoryError) throw categoryError;

        // Insert subcategory
        const { error } = await supabase
            .from('subcategories')
            .insert({
                category_id: categoryData.id,
                code: code,
                name: name,
                description: description
            });

        if (error) throw error;

        alert('Subkategori berhasil ditambahkan');
        $('#addSubcategoryModal').modal('hide');
        
        // Refresh dropdowns
        loadCategories();
        
    } catch (error) {
        console.error('Error saving subcategory:', error);
        alert('Gagal menambahkan subkategori: ' + error.message);
    }
}

// Save product function
async function saveProduct() {
    try {
        const subcategoryId = modalSubcategorySelect.value;
        const code = productCodeInput.value;
        const name = productNameInput.value;
        const hasPocketOption = document.getElementById('hasPocketOption').checked;
        const hasHeaderOption = document.getElementById('hasHeaderOption').checked;
        const description = productDescriptionInput.value;

        if (!subcategoryId || !code || !name) {
            alert('Harap isi semua field yang wajib diisi');
            return;
        }

        // Insert product
        const { error } = await supabase
            .from('products')
            .insert({
                subcategory_id: subcategoryId,
                code: code,
                name: name,
                has_pocket_v_option: hasPocketOption,
                has_header_option: hasHeaderOption,
                description: description
            });

        if (error) throw error;

        alert('Produk berhasil ditambahkan');
        $('#addProductModal').modal('hide');
        
        // Refresh dropdowns
        if (categorySelect.value) {
            loadSubcategories(categorySelect.value);
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Gagal menambahkan produk: ' + error.message);
    }
}

// Save media function
async function saveMedia() {
    try {
        const subcategoryId = modalMediaSubcategorySelect.value;
        const code = mediaCodeInput.value;
        const name = mediaNameInput.value;
        const description = mediaDescriptionInput.value;

        if (!subcategoryId || !code || !name) {
            alert('Harap isi semua field yang wajib diisi');
            return;
        }

        // Insert media
        const { error } = await supabase
            .from('media')
            .insert({
                subcategory_id: subcategoryId,
                code: code,
                name: name,
                description: description
            });

        if (error) throw error;

        alert('Media berhasil ditambahkan');
        $('#addMediaModal').modal('hide');
        
        // Refresh dropdowns
        if (categorySelect.value && subcategorySelect.value) {
            loadMedia(subcategorySelect.value);
        }
        
    } catch (error) {
        console.error('Error saving media:', error);
        alert('Gagal menambahkan media: ' + error.message);
    }
}

// Initialize the application
function init() {
    setupLogin();
    setupUnitConverter();
    downloadQrBtn.addEventListener('click', downloadQRCode);
    
    // Event listeners for dropdown changes
    categorySelect.addEventListener('change', () => {
        if (categorySelect.value) {
            loadSubcategories(categorySelect.value);
        } else {
            subcategorySelect.innerHTML = '<option value="">Pilih Subkategori</option>';
            subcategorySelect.disabled = true;
        }
    });

    subcategorySelect.addEventListener('change', () => {
        if (subcategorySelect.value) {
            loadProducts(subcategorySelect.value);
            loadMedia(subcategorySelect.value);
        } else {
            productSelect.innerHTML = '<option value="">Pilih Produk</option>';
            productSelect.disabled = true;
            mediaSelect.innerHTML = '<option value="">Pilih Media</option>';
            mediaSelect.disabled = true;
        }
    });

    productSelect.addEventListener('change', () => {
        if (productSelect.value) {
            // Reset dimension inputs when product changes
            lengthInput.value = '';
            widthInput.value = '';
            heightInput.value = '';
            
            // Show/hide option fields based on product selection
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            const hasPocketOption = selectedOption.getAttribute('data-has-pocket') === 'true';
            const hasHeaderOption = selectedOption.getAttribute('data-has-header') === 'true';
            
            pocketVOptionContainer.style.display = hasPocketOption ? 'block' : 'none';
            headerOptionContainer.style.display = hasHeaderOption ? 'block' : 'none';
            
            // Reset option values
            if (!hasPocketOption) pocketVSelect.value = '';
            if (!hasHeaderOption) headerSelect.value = '';
        } else {
            pocketVOptionContainer.style.display = 'none';
            headerOptionContainer.style.display = 'none';
        }
    });

    partNumberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        generatePartNumber();
    });

    // Save buttons event listeners
    saveSubcategoryBtn.addEventListener('click', saveSubcategory);
    saveProductBtn.addEventListener('click', saveProduct);
    saveMediaBtn.addEventListener('click', saveMedia);

    // Modal event listeners
    $('#addSubcategoryModal').on('shown.bs.modal', function () {
        // Refresh category dropdown in modal
        loadCategories();
    });

    $('#addProductModal').on('shown.bs.modal', function () {
        // Refresh subcategory dropdown in modal
        if (modalSubcategorySelect.options.length <= 1) {
            loadProducts(subcategorySelect.value);
        }
    });

    $('#addMediaModal').on('shown.bs.modal', function () {
        // Refresh subcategory dropdown in modal
        if (modalMediaSubcategorySelect.options.length <= 1) {
            loadProducts(subcategorySelect.value);
        }
    });
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
