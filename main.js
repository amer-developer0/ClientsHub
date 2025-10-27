// كلمة المرور المشفرة (base64)
const ENCODED_PASSWORD = "c2FyYXNhcmE="; // "sarasara" مشفرة

// فك تشفير كلمة المرور
function decodePassword(encoded) {
    return atob(encoded);
}

// التحقق من كلمة المرور
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const messageDiv = document.getElementById('message');
    const correctPassword = decodePassword(ENCODED_PASSWORD);
    
    if (passwordInput.value === correctPassword) {
        messageDiv.textContent = "تم التحقق بنجاح!";
        messageDiv.className = "message success";
        setTimeout(() => {
            window.location.href = "home.html";
        }, 1000);
    } else {
        messageDiv.textContent = "كلمة المرور غير صحيحة!";
        messageDiv.className = "message error";
        passwordInput.value = "";
    }
}

// إدارة أرقام الموبايل
function initializePhoneNumbers() {
    const container = document.getElementById('phoneNumbersContainer');
    const addBtn = document.getElementById('addPhoneBtn');
    
    // إضافة رقم جديد
    addBtn.addEventListener('click', function() {
        addPhoneField();
    });
    
    // إضافة حذف لأرقام الموبايل المضافة
    container.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-phone-btn')) {
            removePhoneField(e.target);
        }
    });
}

function addPhoneField() {
    const container = document.getElementById('phoneNumbersContainer');
    const phoneGroups = container.querySelectorAll('.phone-input-group');
    
    // لا نسمح بأكثر من 5 أرقام
    if (phoneGroups.length >= 5) {
        alert('لا يمكن إضافة أكثر من 5 أرقام');
        return;
    }
    
    const newPhoneGroup = document.createElement('div');
    newPhoneGroup.className = 'phone-input-group';
    newPhoneGroup.innerHTML = `
        <input type="tel" class="phone-input" placeholder="رقم إضافي (اختياري)">
        <button type="button" class="remove-phone-btn">✕</button>
    `;
    
    container.appendChild(newPhoneGroup);
}

function removePhoneField(button) {
    const container = document.getElementById('phoneNumbersContainer');
    const phoneGroups = container.querySelectorAll('.phone-input-group');
    
    // لا نسمح بحذف الرقم الأول (الإجباري)
    if (phoneGroups.length > 2) {
        button.parentElement.remove();
    } else {
        // إخفاء زر الحذف للرقم الثاني فقط
        button.style.display = 'none';
        button.previousElementSibling.value = ''; // مسح القيمة
    }
}

function getPhoneNumbers() {
    const phoneInputs = document.querySelectorAll('.phone-input');
    const phones = [];
    
    phoneInputs.forEach(input => {
        if (input.value.trim()) {
            phones.push(input.value.trim());
        }
    });
    
    return phones;
}

// تهيئة الصفحات
document.addEventListener('DOMContentLoaded', function() {
    // صفحة كلمة المرور
    if (document.getElementById('loginBtn')) {
        const loginBtn = document.getElementById('loginBtn');
        const passwordInput = document.getElementById('passwordInput');
        
        loginBtn.addEventListener('click', checkPassword);
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
    
    // صفحة تسجيل عميل جديد
    if (document.getElementById('clientForm')) {
        initializeClientForm();
        initializePhoneNumbers();
    }
    
    // صفحة عرض البيانات
    if (document.getElementById('searchInput')) {
        initializeDataPage();
    }
});

// إدارة البيانات في localStorage
function getClients() {
    const clients = localStorage.getItem('clients');
    return clients ? JSON.parse(clients) : [];
}

function saveClient(client) {
    const clients = getClients();
    clients.push(client);
    localStorage.setItem('clients', JSON.stringify(clients));
}

function getNextId() {
    const clients = getClients();
    if (clients.length === 0) return 1;
    const lastId = Math.max(...clients.map(client => parseInt(client.id)));
    return lastId + 1;
}

// تهيئة نموذج العميل
function initializeClientForm() {
    const form = document.getElementById('clientForm');
    const clientIdInput = document.getElementById('clientId');
    
    // تعيين ID التالي تلقائياً
    clientIdInput.value = getNextId();
    
    // تعيين التاريخ الحالي كقيمة افتراضية
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('operationDate').value = today;
    
    // معالجة إرسال النموذج
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // التحقق من الرقم الإجباري
        const requiredPhone = document.querySelector('.phone-input-group:first-child .phone-input');
        if (!requiredPhone.value.trim()) {
            alert('الرجاء إدخال رقم الموبايل الإجباري');
            requiredPhone.focus();
            return;
        }
        
        const client = {
            id: clientIdInput.value,
            name: document.getElementById('clientName').value,
            phones: getPhoneNumbers(), // حفظ جميع أرقام الموبايل
            paymentStatus: document.getElementById('paymentStatus').value,
            deliveryStatus: document.getElementById('deliveryStatus').value,
            operationDate: document.getElementById('operationDate').value || today,
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };
        
        saveClient(client);
        
        // إعادة تعيين النموذج مع الحفاظ على أرقام الموبايل الأساسية
        form.reset();
        
        // إعادة تعيين أرقام الموبايل (إعادة إنشاء الحقول الأساسية فقط)
        const phoneContainer = document.getElementById('phoneNumbersContainer');
        phoneContainer.innerHTML = `
            <div class="phone-input-group">
                <input type="tel" class="phone-input" placeholder="رقم الموبايل (إجباري)" required>
                <span class="phone-required">*</span>
            </div>
            <div class="phone-input-group">
                <input type="tel" class="phone-input" placeholder="رقم إضافي (اختياري)">
                <button type="button" class="remove-phone-btn" style="display: none;">✕</button>
            </div>
        `;
        
        // إعادة تهيئة أحداث أرقام الموبايل
        initializePhoneNumbers();
        
        // تحديث ID التالي
        clientIdInput.value = getNextId();
        
        // تعيين التاريخ الحالي من جديد
        document.getElementById('operationDate').value = today;
        
        alert('تم حفظ بيانات العميل بنجاح!');
    });
}

// تهيئة صفحة البيانات
function initializeDataPage() {
    const searchInput = document.getElementById('searchInput');
    const dataContainer = document.getElementById('dataContainer');
    
    // عرض البيانات عند تحميل الصفحة
    displayClients(getClients(), dataContainer);
    
    // إضافة مستمع للبحث
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const clients = getClients();
        
        if (searchTerm) {
            const filteredClients = clients.filter(client => 
                Object.values(client).some(value => {
                    if (Array.isArray(value)) {
                        // البحث في مصفوفة أرقام الموبايل
                        return value.some(phone => 
                            phone.toString().toLowerCase().includes(searchTerm)
                        );
                    }
                    return value.toString().toLowerCase().includes(searchTerm);
                })
            );
            displayClients(filteredClients, dataContainer);
        } else {
            displayClients(clients, dataContainer);
        }
    });
}

// عرض البيانات في الصفحة
function displayClients(clients, container) {
    if (clients.length === 0) {
        container.innerHTML = '<div class="no-data">لا توجد بيانات لعرضها</div>';
        return;
    }
    
    // ترتيب البيانات من الأحدث إلى الأقدم
    clients.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = clients.map(client => `
        <div class="client-record">
            <button class="copy-btn" onclick="copyClientData(${client.id})">نسخ</button>
            <h3>العميل: ${client.name}</h3>
            <p><strong>رقم العملية:</strong> ${client.id}</p>
            ${client.phones && client.phones.length > 0 ? `
                <p><strong>أرقام الموبايل:</strong></p>
                <div class="phone-numbers">
                    ${client.phones.map(phone => `
                        <div class="phone-number">${phone}</div>
                    `).join('')}
                </div>
            ` : ''}
            <p><strong>حالة الدفع:</strong> ${client.paymentStatus}</p>
            <p><strong>حالة الاستلام:</strong> ${client.deliveryStatus}</p>
            <p><strong>تاريخ العملية:</strong> ${formatDate(client.operationDate)}</p>
            ${client.notes ? `<p><strong>ملاحظات:</strong> ${client.notes}</p>` : ''}
        </div>
    `).join('');
}

// نسخ بيانات العميل
function copyClientData(clientId) {
    const clients = getClients();
    const client = clients.find(c => parseInt(c.id) === parseInt(clientId));
    
    if (!client) return;
    
    const phonesText = client.phones && client.phones.length > 0 
        ? `أرقام الموبايل:\n${client.phones.map(phone => `  - ${phone}`).join('\n')}`
        : 'أرقام الموبايل: لا يوجد';
    
    const textToCopy = `
رقم العملية: ${client.id}
اسم العميل: ${client.name}
${phonesText}
حالة الدفع: ${client.paymentStatus}
حالة الاستلام: ${client.deliveryStatus}
تاريخ العملية: ${formatDate(client.operationDate)}
${client.notes ? `ملاحظات: ${client.notes}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert('تم نسخ بيانات العميل إلى الحافظة');
        })
        .catch(err => {
            console.error('فشل في نسخ النص: ', err);
            // طريقة بديلة للنسخ
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('تم نسخ بيانات العميل إلى الحافظة');
        });
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
}