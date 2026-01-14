// Grade points mapping
const gradePoints = {
    'A+': 4.0,
    'A': 3.5,
    'B+': 3.0,
    'B': 2.5,
    'C+': 2.0,
    'C': 1.5,
    'C-': 1.0,
    'F': 0.0
};

// Store subjects
let subjects = [];
let calculatedGPA = null;

// DOM Elements
const addSubjectBtn = document.getElementById('addSubjectBtn');
const calculateBtn = document.getElementById('calculateBtn');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const subjectsTableBody = document.getElementById('subjectsTableBody');
const subjectsTableFooter = document.getElementById('subjectsTableFooter');
const errorMessage = document.getElementById('errorMessage');
const gpaResult = document.getElementById('gpaResult');
const subjectTypeSelect = document.getElementById('subjectType');
const totalMarksInput = document.getElementById('totalMarks');
const passingMarksInput = document.getElementById('passingMarks');

// Event Listeners
addSubjectBtn.addEventListener('click', addSubject);
calculateBtn.addEventListener('click', calculateGPA);
generatePdfBtn.addEventListener('click', generatePDF);
clearAllBtn.addEventListener('click', clearAll);
subjectTypeSelect.addEventListener('change', syncMarksWithType);
document.getElementById('creditHours').addEventListener('change', hideError);
syncMarksWithType();

// Random obtained marks generator based on grade band
function getRandomObtainedMarks(grade, totalMarks, passingMarks) {
    // Band multipliers (min, max) of totalMarks following provided table
    const bands = {
        'A+': [0.90, 1.00], // ≥ 90%
        'A':  [0.81, 0.89],
        'B+': [0.73, 0.80],
        'B':  [0.65, 0.72],
        'C+': [0.60, 0.64],
        'C':  [0.55, 0.59],
        'C-': [0.50, 0.54],
        'F':  [0.00, 0.49]  // < 50%
    };

    const [minRatio, maxRatio] = bands[grade] || [0.50, 0.74];
    let min = Math.max(Math.floor(minRatio * totalMarks), 0);
    let max = Math.min(Math.floor(maxRatio * totalMarks), totalMarks);

    if (grade === 'F') {
        max = Math.min(max, passingMarks - 1); // always below passing
        if (max < 0) return 0;
        min = Math.min(min, max);
    } else {
        // ensure passing for non-failing grades
        min = Math.max(min, passingMarks);
        if (max < min) max = min;
    }

    const span = Math.max(max - min, 0);
    return min + Math.floor(Math.random() * (span + 1));
}

// Keep marks in sync with selected subject type
function syncMarksWithType() {
    const type = subjectTypeSelect.value;
    if (type === 'Practical') {
        totalMarksInput.value = '50';
        passingMarksInput.value = '25';
    } else {
        totalMarksInput.value = '100';
        passingMarksInput.value = '50';
    }
}

// Add Subject
function addSubject() {
    hideError(); // Clear any previous errors first
    
    if (subjects.length >= 11) {
        alert('Maximum 11 subjects allowed');
        return;
    }

    // Auto-generate Code No (1, 2, 3...)
    const codeNo = (subjects.length + 1).toString();
    const subjectName = document.getElementById('subjectName').value.trim();
    const subjectType = document.getElementById('subjectType').value;
    const totalMarks = parseFloat(document.getElementById('totalMarks').value);
    const passingMarks = parseFloat(document.getElementById('passingMarks').value);
    const creditHours = parseFloat(document.getElementById('creditHours').value);
    const grade = document.getElementById('grade').value;

    // Validation
    if (!subjectName) {
        alert('Please enter subject name');
        return;
    }
    if (!creditHours || creditHours <= 0) {
        alert('Please select valid credit hours');
        return;
    }
    if (!grade) {
        alert('Please select a grade');
        return;
    }

    const gradePoint = gradePoints[grade];
    const qualityPoints = gradePoint * creditHours;
    const obtainedMarks = getRandomObtainedMarks(grade, totalMarks, passingMarks);

    const subject = {
        id: Date.now(),
        codeNo,
        subjectName,
        subjectType,
        totalMarks,
        passingMarks,
        obtainedMarks,
        creditHours,
        grade,
        gradePoint,
        qualityPoints
    };

    subjects.push(subject);
    updateSubjectsTable();
    clearSubjectForm();
    hideError();
    hideGpaResult();
    generatePdfBtn.style.display = 'none';
}

// Clear Subject Form
function clearSubjectForm() {
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectType').value = 'Theory';
    syncMarksWithType();
    document.getElementById('creditHours').value = '';
    document.getElementById('grade').value = 'A+';
}

// Update Subjects Table
function updateSubjectsTable() {
    subjectsTableBody.innerHTML = '';

    if (subjects.length === 0) {
        subjectsTableBody.innerHTML = '<tr><td colspan="10" class="empty-state">No subjects added yet</td></tr>';
        subjectsTableFooter.innerHTML = '';
        return;
    }

    subjects.forEach((subject, index) => {
        const row = document.createElement('tr');
        // Auto-generate Code No based on position (1, 2, 3...)
        const codeNo = (index + 1).toString();
        row.innerHTML = `
            <td>${codeNo}</td>
            <td>${subject.subjectName}</td>
            <td>${subject.subjectType}</td>
            <td>${subject.totalMarks}</td>
            <td>${subject.passingMarks}</td>
            <td>${subject.obtainedMarks}</td>
            <td>${subject.creditHours}</td>
            <td>${subject.grade}</td>
            <td>${subject.qualityPoints.toFixed(2)}</td>
            <td><button class="btn-remove" onclick="removeSubject(${subject.id})">Remove</button></td>
        `;
        subjectsTableBody.appendChild(row);
    });
}

// Remove Subject
function removeSubject(id) {
    subjects = subjects.filter(subject => subject.id !== id);
    updateSubjectsTable();
    hideGpaResult();
    generatePdfBtn.style.display = 'none';
    calculatedGPA = null;
}

// Calculate GPA
function calculateGPA() {
    if (subjects.length === 0) {
        showError('Please add at least one subject before calculating GPA');
        return;
    }

    const totalCreditHours = subjects.reduce((sum, subject) => sum + subject.creditHours, 0);
    const totalQualityPoints = subjects.reduce((sum, subject) => sum + subject.qualityPoints, 0);
    const gpa = totalQualityPoints / totalCreditHours;

    calculatedGPA = {
        totalCreditHours,
        totalQualityPoints,
        gpa: gpa.toFixed(2)
    };

    // Update footer
    subjectsTableFooter.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: right; font-weight: bold;">Total:</td>
            <td>${totalCreditHours.toFixed(1)}</td>
            <td></td>
            <td>${totalQualityPoints.toFixed(2)}</td>
            <td></td>
        </tr>
    `;

    // Show GPA Result
    gpaResult.innerHTML = `
        <h3>GPA Calculated Successfully!</h3>
        <div class="gpa-value">${calculatedGPA.gpa}</div>
        <div class="gpa-details">
            <p><strong>Total Credit Hours:</strong> ${totalCreditHours.toFixed(1)}</p>
            <p><strong>Total Quality Points:</strong> ${totalQualityPoints.toFixed(2)}</p>
        </div>
    `;
    gpaResult.classList.add('show');
    generatePdfBtn.style.display = 'inline-block';
    hideError();
}

// Create manual table if autoTable is not available
function createManualTable(doc, startY, tableData) {
    // Match on-screen table: code, subject name, type, and marks breakdown
    const header = ['CODE NO', 'SUBJECT', 'TYPE', 'TOTAL MARKS', 'PASSING MARKS', 'OBTAINED', 'CREDIT HOURS', 'GRADE', 'QUALITY POINTS'];
    const colWidths = [10, 30, 13, 13, 13, 13, 13, 11, 14];
    const startX = 20;
    let currentY = startY;
    const rowHeight = 7;
    
    // Draw header
    doc.setFillColor(0, 0, 0);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    let xPos = startX;
    header.forEach((text, i) => {
        doc.rect(xPos, currentY, colWidths[i], rowHeight, 'F');
        doc.text(text, xPos + colWidths[i] / 2, currentY + rowHeight / 2, { align: 'center' });
        xPos += colWidths[i];
    });
    
    currentY += rowHeight;
    
    // Draw rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    tableData.forEach((row, rowIndex) => {
        xPos = startX;
        row.forEach((cell, colIndex) => {
            // Draw border
            doc.rect(xPos, currentY, colWidths[colIndex], rowHeight, 'S');
            // Draw text
            const cellText = String(cell || '');
            doc.text(cellText, xPos + 2, currentY + rowHeight / 2 + 2);
            xPos += colWidths[colIndex];
        });
        currentY += rowHeight;
        
        // Add new page if needed
        if (currentY > 270) {
            doc.addPage();
            currentY = 20;
        }
    });
    
    return currentY + 10;
}

// Validate Student Information
function isValidYear(year) {
    if (!/^\d{4}$/.test(year)) return false;
    const y = parseInt(year, 10);
    return y >= 1900 && y <= 2100;
}

function validateStudentInfo() {
    const studentName = document.getElementById('studentName').value.trim();
    const rollNumber = document.getElementById('rollNumber').value.trim();
    const batch = document.getElementById('batch').value.trim();
    const semester = document.getElementById('semester').value.trim();
    const examMonth = document.getElementById('examMonth').value.trim();
    const year = document.getElementById('year').value.trim();

    if (!studentName || !rollNumber || !batch || !semester || !examMonth || !year) {
        alert('Please fill all student information before generating PDF.');
        return false;
    }

    if (!/^[a-zA-Z0-9]+$/.test(rollNumber)) {
        alert('Roll Number / I.D. No must contain letters and numbers only (e.g., K20SW075).');
        return false;
    }

    if (!isValidYear(year)) {
        alert('Enter a valid 4-digit year (e.g., 2024).');
        return false;
    }

    hideError();
    return true;
}

// Generate PDF
function generatePDF() {
    console.log('Generate PDF button clicked');
    try {
        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
            showError('PDF library is not loaded. Please refresh the page and try again.');
            console.error('jsPDF library not found');
            return;
        }
        console.log('jsPDF library found');

        // Validate student information
        if (!validateStudentInfo()) {
            return;
        }

        if (!calculatedGPA) {
            showError('Please calculate GPA first before generating PDF.');
            return;
        }

        if (subjects.length === 0) {
            showError('Please add at least one subject before generating PDF.');
            return;
        }

        hideError();

        // Get student information
        const studentName = document.getElementById('studentName').value.trim();
        const rollNumber = document.getElementById('rollNumber').value.trim();
        const batch = document.getElementById('batch').value.trim();
        const semester = document.getElementById('semester').value.trim();
        const examMonth = document.getElementById('examMonth').value.trim();
        const year = document.getElementById('year').value.trim();

        // Generate random Book No and Certificate No
        const bookNo = Math.floor(Math.random() * 9000) + 1000;
        const certificateNo = Math.floor(Math.random() * 900000) + 100000;

        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('portrait', 'mm', 'a4');

        // Function to generate PDF content
        const generatePDFContent = (logoImg = null, signatureImg = null) => {
            // Set font
            doc.setFont('helvetica');

            
            // Header - University Name (3 lines) - BEFORE logo (user requested name first, then logo)
            const topMargin = 20;
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('MEHRAN UNIVERSITY', 105, topMargin, { align: 'center' });
            doc.text('OF', 105, topMargin + 7, { align: 'center' });
            doc.text('ENGINEERING & TECHNOLOGY', 105, topMargin + 14, { align: 'center' });

           
            // Add logo centered below header (if provided)
            if (logoImg) {
                console.log('🔍 Logo object received:', logoImg);
                console.log('Logo complete:', logoImg.complete);
                console.log('Logo width:', logoImg.width, 'height:', logoImg.height);
                console.log('Logo naturalWidth:', logoImg.naturalWidth, 'naturalHeight:', logoImg.naturalHeight);
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const originalWidth = logoImg.naturalWidth || logoImg.width || 200;
                    const originalHeight = logoImg.naturalHeight || logoImg.height || 200;

                    const targetWidthPx = 80; // target width in px
                    const scale = targetWidthPx / originalWidth;
                    const targetHeightPx = originalHeight * scale;

                    const logoWidthMm = targetWidthPx * 0.264583;
                    const logoHeightMm = targetHeightPx * 0.264583;

                    canvas.width = originalWidth;
                    canvas.height = originalHeight;
                    ctx.drawImage(logoImg, 0, 0, originalWidth, originalHeight);

                    const imgData = canvas.toDataURL('image/png');

                    const pageWidth = 210; // A4 width in mm
                    const logoX = (pageWidth - logoWidthMm) / 2;
                    const logoY = topMargin + 20; // place logo just below header

                    doc.addImage(imgData, 'PNG', logoX, logoY, logoWidthMm, logoHeightMm);
                    console.log('✅ Logo added to PDF centered below header');
                } catch (e) {
                    console.error('❌ Error adding logo with canvas method:', e);
                    // Try direct method as fallback
                    try {
                        console.log('Trying direct method as fallback...');
                        const fallbackWidthPx = 80;
                        const fallbackScale = fallbackWidthPx / (logoImg.naturalWidth || logoImg.width || 200);
                        const fallbackHeightPx = (logoImg.naturalHeight || logoImg.height || 200) * fallbackScale;
                        const fallbackWidthMm = fallbackWidthPx * 0.264583;
                        const fallbackHeightMm = fallbackHeightPx * 0.264583;
                        const fallbackX = (210 - fallbackWidthMm) / 2;
                        const fallbackY = topMargin + 26;
                        doc.addImage(logoImg, 'PNG', fallbackX, fallbackY, fallbackWidthMm, fallbackHeightMm);
                        console.log('✅ Logo added using direct method');
                    } catch (e2) {
                        console.error('❌ Could not add logo with direct method:', e2);
                        console.error('Direct method error:', e2.message);
                    }
                }
            } else {
                console.log('⚠️ Logo image is NULL - make sure images.png exists');
            }
        
        
        // SHAHEED text - smaller size but BOLD as requested
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('SHAHEED ZULFIQAR ALI BHUTTO CAMPUS, KHARPUR MIR\'S', 105, 52, { align: 'center' });

        // Book No (left) and Certificate No (right)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Book No: ${bookNo}`, 20, 45);
        doc.text(`Certificate No: ${certificateNo}`, 150, 45);
        doc.setFont('helvetica', 'bold');
         doc.text(`ORIGINAL`, 20, 50);
        // Replace centered 'ORIGINAL' with fixed Book No as requested
        doc.text('GRADE CERTIFICATE', 105, 65, { align: 'center' });

        // Student Information Section
        let yPos = 75;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        doc.text('The grades obtained by', 20, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(studentName, 70, yPos);
        
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('having ID.No', 20, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(rollNumber, 70, yPos);
        
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('in', 20, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(semester, 70, yPos);
        
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('B.E of', 20, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(`${batch}`, 70, yPos);

         yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('Type of Examination', 20, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text('Regular Examination', 70, yPos);
        
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('held in the month of', 20, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(`${examMonth}, ${year}`, 70, yPos);


        doc.setFont('helvetica', 'normal');
        doc.text('are given below : ', 100, yPos);
        
       

        // Table - Group Theory and Practical together
        yPos += 5;
        const tableData = [];
        
        // Group subjects by name (Theory + Practical pairs)
        const subjectGroups = {};
        subjects.forEach((subject, index) => {
            const name = subject.subjectName;
            if (!subjectGroups[name]) {
                subjectGroups[name] = {
                    codeNo: '', 
                    theory: null, practical: null };
            }
            if (subject.subjectType === 'Theory') {
                subjectGroups[name].theory = subject;
            } else {
                subjectGroups[name].practical = subject;
            }
        });

        // Build table rows with merged subject names
        Object.keys(subjectGroups).forEach(subjectName => {
            const group = subjectGroups[subjectName];
            const theory = group.theory;
            const practical = group.practical;
            
            if (theory) {
                tableData.push([
                    { content: group.codeNo, rowSpan: (practical ? 2 : 1) },
                    { content: subjectName, rowSpan: (practical ? 2 : 1) },
                    'Theory',
                    theory.totalMarks.toString(),
                    theory.passingMarks.toString(),
                    theory.obtainedMarks.toString(),
                    theory.creditHours.toString(),
                    theory.grade || '',
                    theory.qualityPoints.toFixed(2)
                ]);
            }
            
            if (practical) {
                if (!theory) {
                    // Practical only (no theory)
                    tableData.push([
                        group.codeNo,
                        subjectName,
                        'Practical',
                        practical.totalMarks.toString(),
                        practical.passingMarks.toString(),
                        practical.obtainedMarks.toString(),
                        practical.creditHours.toString(),
                        practical.grade || '',
                        practical.qualityPoints.toFixed(2)
                    ]);
                } else {
                    // Practical row (subject name already in theory row)
                    tableData.push([
                        'Practical',
                        practical.totalMarks.toString(),
                        practical.passingMarks.toString(),
                        practical.obtainedMarks.toString(),
                        practical.creditHours.toString(),
                        practical.grade || '',
                        practical.qualityPoints.toFixed(2)
                    ]);
                }
            }
        });

        // Add summary row
        tableData.push([
            '',
            '',
            '',
            '',
            '',
            '',
            calculatedGPA.totalCreditHours.toFixed(1),
            '',
            calculatedGPA.totalQualityPoints.toFixed(2)
        ]);

        // Check if autoTable is available, otherwise use manual table
        let finalY = yPos;
        
        if (typeof doc.autoTable !== 'undefined') {
            console.log('✅ Using autoTable to create table');
            try {
                doc.autoTable({
                    startY: yPos,
                    head: [['CODE NO', 'SUBJECT', 'TYPE', 'TOTAL MARKS', 'PASSING MARKS', 'OBTAINED', 'CREDIT HOURS', 'GRADE', 'QUALITY POINTS']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [0, 0, 0],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 8
                    },
                    bodyStyles: {
                        fontSize: 8,
                        textColor: [0, 0, 0]
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    },
                    // Reduce margins and enable line-wrapping so long subject names don't force overflow
                    styles: {
                        cellPadding: 2,
                        lineColor: [0, 0, 0],
                        lineWidth: 0.1,
                        overflow: 'linebreak'
                    },
                    columnStyles: {
                        0: { cellWidth: 15 },   // CODE NO
                        1: { cellWidth: 30 },   // SUBJECT NAME
                        2: { cellWidth: 15 },   // TYPE
                        3: { cellWidth: 20 },   // TOTAL MARKS
                        4: { cellWidth: 20 },   // PASSING MARKS
                        5: { cellWidth: 17 },   // OBTAINED
                        6: { cellWidth: 20 },   // CREDIT HOURS
                        7: { cellWidth: 15 },   // GRADE
                        8: { cellWidth: 20 }    // QUALITY POINTS
                    },
                    margin: { left: 20, right: 20 }
                });
                finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : yPos + 50;
            } catch (e) {
                console.error('Error using autoTable, falling back to manual table:', e);
                finalY = createManualTable(doc, yPos, tableData);
            }
        } else {
            console.warn('⚠️ autoTable not available, using manual table');
            finalY = createManualTable(doc, yPos, tableData);
        }

        // Summary Section
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Total Credit Hours:', 20, finalY);
         doc.setFont('helvetica', 'bold');
        doc.text(calculatedGPA.totalCreditHours.toFixed(1), 50, finalY);
         doc.setFont('helvetica', 'normal');
        doc.text('Total Quality Points:', 80, finalY);
         doc.setFont('helvetica', 'bold');
        doc.text(calculatedGPA.totalQualityPoints.toFixed(2), 110, finalY);
         doc.setFont('helvetica', 'normal');
        doc.text('G.P.A', 140, finalY);
         doc.setFont('helvetica', 'bold');
        doc.text(calculatedGPA.gpa, 150, finalY);

        // Date of Declaration
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-GB');
        doc.setFont('helvetica', 'normal');
        doc.text('Date of Declaration of Result:', 20, finalY + 7);
        doc.setFont('helvetica', 'bold');
        doc.text(dateStr, 70, finalY + 7);

        // Remarks
        doc.setFont('helvetica', 'bold');
        
        doc.text('Remarks:', 20, finalY + 14);
       
        doc.text('Pass', 40, finalY + 14);

        // Footer Section
        let footerY = finalY + 20;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Received Rs : ', 20, footerY);
        doc.text('Valid Challan No.', 50, footerY);
        doc.text('Dated:', 90, footerY);

        // Prepared By, Checked By
        doc.text('Prepared By:', 20, footerY +7);
         doc.setFont('helvetica', 'bold');
        doc.text('Arifa Afzal',40,footerY+7)
         doc.setFont('helvetica', 'normal');
        doc.text('Checked By:', 60, footerY +7);
         doc.setFont('helvetica', 'bold');
        doc.text('Hassan Chajro',80,footerY+7)

        // Place and Date
        // doc.text('Place and Date of Issuance:', 20, footerY + 35);
        doc.text('Jamshoro, Dated ' + dateStr, 20, footerY + 25);

        // Authority - Add signature above controller text
        const controllerSignatureY = footerY + 30;
        
        // Add signature image if provided
        if (signatureImg) {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const sigWidth = signatureImg.naturalWidth || signatureImg.width || 100;
                const sigHeight = signatureImg.naturalHeight || signatureImg.height || 80;
                
                // Scale signature to 40mm width
                const targetWidthMm = 40;
                const targetWidthPx = targetWidthMm / 0.264583;
                const scale = targetWidthPx / sigWidth;
                const targetHeightMm = targetWidthMm * (sigHeight / sigWidth);
                
                canvas.width = sigWidth;
                canvas.height = sigHeight;
                ctx.drawImage(signatureImg, 0, 0, sigWidth, sigHeight);
                
                const sigImgData = canvas.toDataURL('image/png');
                
                // Position signature above controller text (3-4mm gap)
                const sigX = 150 - targetWidthMm / 2; // Center horizontally
                const sigY = controllerSignatureY - targetHeightMm - 3; // 3mm above controller text
                
                doc.addImage(sigImgData, 'PNG', sigX, sigY, targetWidthMm, targetHeightMm);
                console.log('✅ Signature added to PDF above Controller text');
            } catch (e) {
                console.error('Error adding signature to PDF:', e);
            }
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTROLLER OF EXAMINATIONS', 120, controllerSignatureY);

        // Footer Notes
        footerY += 45;
         doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        // Place 'Authority:' above the footer notes (provide a Y coordinate)
        doc.text('Note:', 20, footerY - 4);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('1. The University reserves the right of issuing any correction in the result if any mistake is detected later.', 20, footerY, { maxWidth: 170 });
        footerY += 4;
        doc.text('2. This certificate has been issued without any erasure/overwriting.', 20, footerY, { maxWidth: 170 });
        footerY += 4;
        doc.text('3. Error or omission if any occurred inadvertently can be rectified at any stage on the basis of original record.', 20, footerY, { maxWidth: 170 });

        // Save PDF
        const fileName = `MUET_SZAB_GPA_Certificate_${rollNumber}_${year}.pdf`;
        console.log('Saving PDF:', fileName);
        doc.save(fileName);
        console.log('PDF saved successfully');
    };

    // Try to load logo and signature, then generate PDF
    const loadLogoAndSignatureAndGenerate = () => {
        const img = new Image();
        const sig = new Image();
        let logoLoaded = false;
        let signatureLoaded = false;

        if (window.location && window.location.protocol === 'file:') {
            console.warn('Warning: page is loaded via file:// — this can cause CORS/tainted canvas errors. Serve via HTTP to fix image->canvas exports.');
        }

        // Allow CORS-enabled image loading
        try {
            img.crossOrigin = 'anonymous';
            sig.crossOrigin = 'anonymous';
        } catch (e) {
            // Some environments may disallow setting crossOrigin; ignore silently.
        }
        
        // Check if both images are ready and generate PDF
        const checkAndGenerate = () => {
            // Always generate if either logo or signature load completes
            // Don't wait for both - generate with whatever is available
            console.log('📋 Generating PDF with available images...');
            generatePDFContent(logoLoaded ? img : null, signatureLoaded ? sig : null);
        };
        
        // Logo loaded handler
        img.onload = function() {
            console.log('✅ Logo loaded successfully!');
            logoLoaded = true;
            // If signature already tried loading, generate now
            if (signatureLoaded || window.signatureLoadAttempted) {
                checkAndGenerate();
            }
        };
        
        img.onerror = function(error) {
            console.error('❌ Logo failed to load!');
            logoLoaded = false;
            // If signature already tried loading, generate now
            if (signatureLoaded || window.signatureLoadAttempted) {
                checkAndGenerate();
            }
        };
        
        // Signature loaded handler
        sig.onload = function() {
            console.log('✅ Signature loaded successfully!');
            signatureLoaded = true;
            window.signatureLoadAttempted = true;
            // If logo already tried loading, generate now
            if (logoLoaded || window.logoLoadAttempted) {
                checkAndGenerate();
            }
        };
        
        sig.onerror = function() {
            console.log('ℹ️ Signature not found (optional) - continuing without it');
            signatureLoaded = false;
            window.signatureLoadAttempted = true;
            // If logo already tried loading, generate now
            if (logoLoaded || window.logoLoadAttempted) {
                checkAndGenerate();
            }
        };
        
        // Try multiple paths for logo
        const logoPaths = [
            'images.png',
            './images.png',
            window.location.pathname.replace(/[^/]*$/, '') + 'images.png'
        ];
        
        let logoPathIndex = 0;
        const tryNextLogoPath = () => {
            if (logoPathIndex < logoPaths.length) {
                const path = logoPaths[logoPathIndex];
                console.log(`Trying to load logo from: ${path}`);
                img.src = path;
                logoPathIndex++;
            } else {
                window.logoLoadAttempted = true;
                console.log('⚠️ All logo paths failed');
                if (window.signatureLoadAttempted) {
                    checkAndGenerate();
                }
            }
        };
        
        // Try multiple paths for signature
        const sigPaths = [
            'signature.png',
            './signature.png',
            window.location.pathname.replace(/[^/]*$/, '') + 'signature.png'
        ];
        
        let sigPathIndex = 0;
        const tryNextSigPath = () => {
            if (sigPathIndex < sigPaths.length) {
                const path = sigPaths[sigPathIndex];
                console.log(`Trying to load signature from: ${path}`);
                sig.src = path;
                sigPathIndex++;
            } else {
                window.signatureLoadAttempted = true;
                console.log('⚠️ All signature paths failed');
                if (window.logoLoadAttempted) {
                    checkAndGenerate();
                }
            }
        };
        
        // Set error handlers to try next paths
        const originalLogoError = img.onerror;
        img.onerror = function(error) {
            if (logoPathIndex < logoPaths.length) {
                console.log(`Logo path ${logoPaths[logoPathIndex - 1]} failed, trying next...`);
                tryNextLogoPath();
            } else {
                originalLogoError.call(this, error);
            }
        };
        
        const originalSigError = sig.onerror;
        sig.onerror = function() {
            if (sigPathIndex < sigPaths.length) {
                console.log(`Signature path ${sigPaths[sigPathIndex - 1]} failed, trying next...`);
                tryNextSigPath();
            } else {
                originalSigError.call(this);
            }
        };
        
        // Start loading both images in parallel
        tryNextLogoPath();
        tryNextSigPath();
    };
    
    // Start logo and signature loading, then generate PDF
    loadLogoAndSignatureAndGenerate();
    
    } catch (error) {
        console.error('Error generating PDF:', error);
        console.error('Error stack:', error.stack);
        showError('Error generating PDF: ' + error.message + '. Please check console (F12) for details.');
    }
}

// Clear All
function clearAll() {
    if (confirm('Are you sure you want to clear all data?')) {
        subjects = [];
        calculatedGPA = null;
        updateSubjectsTable();
        clearSubjectForm();
        document.getElementById('studentName').value = '';
        document.getElementById('rollNumber').value = '';
        document.getElementById('batch').value = '';
        document.getElementById('semester').value = '';
        document.getElementById('examMonth').value = '';
        document.getElementById('year').value = '';
        hideGpaResult();
        hideError();
        generatePdfBtn.style.display = 'none';
    }
}

// Show Error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// Hide Error
function hideError() {
    errorMessage.classList.remove('show');
}

// Hide GPA Result
function hideGpaResult() {
    gpaResult.classList.remove('show');
}

// Check if libraries are loaded
function checkLibraries() {
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF library not loaded');
        showError('PDF library is not loaded. Please refresh the page.');
        return false;
    }
    return true;
}

// Initialize
updateSubjectsTable();

// Check libraries on page load
window.addEventListener('load', function() {
    setTimeout(function() {
        if (!checkLibraries()) {
            console.error('Required libraries not available');
        } else {
            console.log('All libraries loaded successfully');
        }
    }, 1000);
});

