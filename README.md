# MUET SZAB GPA Certificate

A web-based GPA calculator for students at Mehran University of Engineering & Technology (MUET), Shaheed Zulfiqar Ali Bhutto Campus, Khairpur Mir's.

## Features

- **Student Information Input**: Enter name, roll number, batch, semester, and examination details
- **Subject Management**: Add multiple subjects with credit hours and grades
- **Grade Entry**: Select from A+ (4.0) to F (0.0) grading scale
- **Automatic Calculation**: Calculates quality points and GPA automatically
- **PDF Certificate Generation**: Generate a professional grade certificate in PDF format
- **Subject Removal**: Remove subjects individually if needed
- **Clear All**: Reset the entire form and data
- **Responsive Design**: Works on desktop and mobile devices
- **Input Validation**: Comprehensive error checking and user feedback

## How to Use

1. **Open the Application**
   - Open `index.html` in your web browser

2. **Enter Student Information**
   - Fill in student name, roll number, batch, semester, examination month, and year
   - These fields are required for PDF generation

3. **Add Subjects**
   - Enter subject name
   - Select subject type (Theory/Practical)
   - Select credit hours (1, 2, or 3)
   - Select grade (A+ to F)
   - Click "Add Subject"

4. **Calculate GPA**
   - Click "Calculate GPA" button
   - View the calculated GPA and quality points
   - "Generate PDF" button will appear after calculation

5. **Generate PDF**
   - Click "Generate PDF" to download a professional grade certificate
   - The PDF includes all subject details, GPA, and official university information

6. **Clear Data**
   - Click "Clear All" to reset everything

## File Structure

```
GPA/
├── index.html          # Main HTML file with form structure
├── script.js           # JavaScript for calculations and functionality
├── style.css           # CSS styling and responsive design
├── images.png          # University logo (optional)
├── signature.png       # Authority signature (optional)
└── README.md          # This file
```

## Grade Scale

| Grade | Points | Range  |
|-------|--------|--------|
| A+    | 4.0    | ≥ 90%  |
| A     | 3.5    | 81-89% |
| B+    | 3.0    | 73-80% |
| B     | 2.5    | 65-72% |
| C+    | 2.0    | 60-64% |
| C     | 1.5    | 55-59% |
| C-    | 1.0    | 50-54% |
| F     | 0.0    | < 50%  |

## Subject Types

- **Theory**: Total marks = 100, Passing marks = 50
- **Practical**: Total marks = 50, Passing marks = 25

## Technical Details

- **HTML5**: Semantic markup and form structure
- **CSS3**: Modern styling with flexbox and grid layouts
- **JavaScript**: Dynamic calculations and DOM manipulation
- **jsPDF & jsPDF-AutoTable**: PDF generation libraries
- **CDN**: Uses CDNJS for external libraries

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for CDN libraries)
- JavaScript enabled

## PDF Generation

The application can generate professional grade certificates in PDF format including:
- University header and logo
- Student information
- Complete subject details
- GPA calculation
- Official signatures and seals
- Date of declaration
- University remarks

### Required Files for PDF (Optional)
- `images.png` - University/Campus logo
- `signature.png` - Authority signature

If these files are missing, the PDF still generates successfully without images.

## Troubleshooting

### PDF Library Not Loading
- Ensure you have an active internet connection
- Refresh the page (Ctrl+R or Cmd+R)
- Check browser console (F12) for error messages

### Image Not Appearing in PDF
- Place `images.png` and `signature.png` in the same folder as `index.html`
- Ensure images are in PNG format
- Maximum recommended size: 500x500 pixels

### CORS Warning (File Protocol)
- This is normal when opening via file:// protocol
- For production, serve files via HTTP/HTTPS
- Use a local server: Python (`python -m http.server 8000`) or Node.js (`npx http-server`)

## Supported Subjects

- Maximum 11 subjects per semester
- Support for both Theory and Practical subjects
- Automatic code numbering (1, 2, 3, etc.)

## Notes

- All calculations follow MUET grading standards
- Obtained marks are randomly generated based on grade range
- GPA is calculated as: Total Quality Points ÷ Total Credit Hours
- The application stores data in browser memory (not persistent)

## Credits

Developed for MUET SZAB, Khairpur Mir's, Pakistan

---

**Last Updated**: January 2026
