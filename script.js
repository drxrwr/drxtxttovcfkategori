document.getElementById('processFilesBtn').addEventListener('click', function() {
    const files = document.getElementById('file-input').files;
    const fileAreas = document.getElementById('file-areas');
    const startCategory = document.getElementById('startCategoryInput').value.trim().toLowerCase(); // Ambil kategori awal
    const globalContactName = document.getElementById('globalContactNameInput').value.trim(); // Ambil nama kontak global
  
    fileAreas.innerHTML = ''; // Kosongkan div sebelum menambahkan textarea baru
  
    // Ambil status toggle untuk fitur angka nol
    const isZeroPaddingEnabled = document.getElementById('zeroPaddingToggle').checked;
  
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const textArea = document.createElement('textarea');
            textArea.classList.add('small-textarea');
            textArea.value = e.target.result;
  
            // Input untuk memasukkan nama file VCF
            const fileNameInput = document.createElement('input');
            fileNameInput.type = 'text';
            fileNameInput.placeholder = `Masukkan nama file VCF (Default: ${file.name.replace('.txt', '')})`;
            fileNameInput.classList.add('file-name-input');
  
            const fileNameLabel = document.createElement('label');
            fileNameLabel.textContent = `Nama File Asal: ${file.name}`;
            fileNameLabel.classList.add('file-name-label');
  
            const contactsCountLabel = document.createElement('p');
            const lines = e.target.result.split('\n').map(line => line.trim());
            const contactsCount = lines.filter(line => !isNaN(line) && line !== '').length;
            contactsCountLabel.textContent = `Jumlah Kontak: ${contactsCount}`;
  
            const generateButton = document.createElement('button');
            generateButton.textContent = 'Generate VCF';
            generateButton.classList.add('generate-vcf-btn');
            generateButton.addEventListener('click', () => {
                const fileContactName = globalContactName || file.name.replace('.txt', ''); // Gunakan nama file jika nama kontak kosong
                const filename = fileNameInput.value.trim() || file.name.replace('.txt', ''); // Gunakan nama file asli jika nama file kosong
                let vcfContent = '';
                let contactIndex = 1;
                let foundStartCategory = startCategory === ''; // Jika kategori kosong, mulai konversi langsung
                let validCategories = ['admin', 'navy', 'anggota']; // Kategori yang valid
                let startConverting = false; // Flag untuk memulai konversi setelah kategori ditemukan
  
                // Function to add zero padding based on total contacts, only if the feature is enabled
                const addZeroPadding = (index, total) => {
                    if (!isZeroPaddingEnabled) {
                        return index.toString(); // Tidak ada padding jika fitur dimatikan
                    }
                    if (total <= 10) {
                        return index.toString().padStart(2, '0'); // 01, 02, ..., 10
                    } else if (total <= 999) {
                        return index.toString().padStart(3, '0'); // 001, 002, ..., 100
                    } else if (total <= 9999) {
                        return index.toString().padStart(4, '0'); // 0001, 0002, ..., 1000
                    }
                    return index.toString(); // default without padding
                };
  
                lines.forEach(line => {
                    const lowerLine = line.toLowerCase();
  
                    // Jika kategori diisi, mulai dari kategori yang dipilih
                    if (startCategory && lowerLine === startCategory) {
                        foundStartCategory = true; // Mulai konversi dari kategori yang dipilih
                        startConverting = true; // Mulai konversi setelah kategori ditemukan
                        return; // Jangan konversi baris kategori itu sendiri
                    } else if (startCategory && validCategories.includes(lowerLine)) {
                        startConverting = false; // Berhenti jika menemukan kategori lain saat startCategory dipilih
                    }
  
                    // Mulai konversi hanya jika startConverting true
                    if ((foundStartCategory || !startCategory) && startConverting && line && !validCategories.includes(lowerLine)) {
                        let phoneNumber = line;
                        if (!phoneNumber.startsWith('+')) {
                            phoneNumber = '+' + phoneNumber;
                        }
                        const paddedIndex = addZeroPadding(contactIndex, contactsCount);
                        vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${fileContactName}-${paddedIndex}\nTEL:${phoneNumber}\nEND:VCARD\n\n`;
                        contactIndex++;
                    }
                });
  
                if (vcfContent) {
                    const blob = new Blob([vcfContent], { type: 'text/vcard' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${filename}.vcf`;
                    a.textContent = `Download ${filename}.vcf`;
                    a.style.display = 'block';
                    a.click();
                    URL.revokeObjectURL(url);
                } else {
                    console.error('Tidak ada konten VCF yang digenerate.');
                    alert('Tidak ada kontak yang berhasil di-convert.');
                }
            });
  
            fileAreas.appendChild(fileNameLabel);
            fileAreas.appendChild(fileNameInput);
            fileAreas.appendChild(textArea);
            fileAreas.appendChild(contactsCountLabel);
            fileAreas.appendChild(generateButton);
        };
        reader.readAsText(file);
    });
});
