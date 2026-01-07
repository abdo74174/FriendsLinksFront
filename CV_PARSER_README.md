# CV Parser System

A comprehensive CV (Resume) parsing system that extracts structured information from CV text or files and returns it in JSON format.

## Features

### Backend (.NET Core API)

- **Smart CV Parsing**: Automatically extracts key information from CV text
- **Multiple Input Methods**: 
  - Parse from plain text
  - Upload PDF, DOCX, or TXT files
- **Structured Data Extraction**:
  - Full Name
  - Email Address
  - Phone Number
  - Skills (e.g., Flutter, .NET, SQL, React)
  - Years of Experience
  - Education
  - Certifications
  - Languages

### Frontend (HTML/CSS/JavaScript)

- **Modern UI**: Beautiful, responsive interface
- **Dual Input Modes**:
  - Paste CV text directly
  - Drag & drop file upload
- **Real-time Results**: Displays parsed data in a clean, organized format
- **JSON Export**: Copy parsed results as JSON
- **Error Handling**: User-friendly error messages

## Architecture

### Backend Structure

```
DataDisplayConnection/
├── Controllers/
│   ├── CvParserController.cs      # API endpoints for CV parsing
│   └── ProfileController.cs
├── Services/
│   └── CvParserService.cs         # Core parsing logic
├── models/
│   ├── CvParseResult.cs          # Result model
│   └── ProfileClass.cs
└── UploadedCVs/                  # Storage for uploaded files
```

### Frontend Structure

```
friendsLinks/
├── cv-parser.html                # CV Parser page
├── js/
│   └── cvParser.js              # Parser UI logic
└── style.css                    # Shared styles
```

## API Endpoints

### 1. Parse CV from Text

**Endpoint**: `POST /api/CvParser/parse-text`

**Request Body**:
```json
{
  "cvText": "John Smith\\nEmail: john@example.com\\n...",
  "fileName": "optional_file_name"
}
```

**Response**:
```json
{
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+1-234-567-8900",
  "skills": ["Flutter", ".NET", "SQL", "React"],
  "experienceYears": 5,
  "education": "Bachelor of Science in Computer Science",
  "certifications": ["AWS Certified Developer"],
  "languages": ["English", "Spanish"],
  "cvSaved": true
}
```

### 2. Parse CV from File

**Endpoint**: `POST /api/CvParser/parse-file`

**Request**: Multipart form data with file upload

**Supported Formats**: PDF, DOCX, DOC, TXT

**Response**: Same as parse-text endpoint

### 3. Get Example Result

**Endpoint**: `GET /api/CvParser/example`

**Response**: Example CV parse result

## Parsing Logic

The CV parser uses intelligent pattern matching to extract information:

### Name Extraction
- Looks for name patterns at the beginning of CV
- Validates 2-4 word names with alphabetic characters
- Skips common headers like "Resume", "CV"

### Email Extraction
- Uses regex pattern: `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}`

### Phone Extraction
- Supports multiple formats:
  - International: +1-234-567-8900
  - Domestic: (234) 567-8900
  - Plain: 2345678900

### Skills Extraction
- Matches against 50+ technology keywords
- Case-insensitive matching
- Includes: Flutter, React, .NET, Python, AWS, etc.

### Experience Calculation
- Pattern matching: "5 years of experience"
- Date range analysis: "2018-2023"
- Defaults to 0 if not found

### Education Extraction
- Identifies degree types: PhD, Master, Bachelor, etc.
- Captures full education line

### Certifications & Languages
- Keyword-based detection
- Returns up to 5 most relevant items

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd f:\projects\DataDisplayConnection
   ```

2. **Restore dependencies**:
   ```bash
   dotnet restore
   ```

3. **Run the backend**:
   ```bash
   dotnet run --project DataDisplayConnection
   ```

4. **Backend will start on**: `http://localhost:5240`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd f:\projects\wep_projects\friendsLinks
   ```

2. **Open with a local server**:
   - Use VS Code Live Server extension
   - Or use Python: `python -m http.server 8000`
   - Or use Node.js: `npx serve`

3. **Access the CV Parser**:
   - Open: `http://localhost:8000/cv-parser.html`

## Usage Guide

### Using Text Input

1. Click on "Paste Text" tab
2. Paste your CV text in the textarea
3. Click "Parse CV Text"
4. View structured results below

### Using File Upload

1. Click on "Upload File" tab
2. Drag & drop a CV file or click to browse
3. Select a PDF, DOCX, or TXT file
4. Click "Parse CV File"
5. View structured results below

### Copying Results

- Click "Copy JSON" button to copy the parsed data
- Use the JSON in your application or save it

## Configuration

### Backend Configuration

**Port**: Configure in `appsettings.json` or use default 5240

**CORS**: Already configured to allow all origins for development

**File Storage**: Files are saved in `UploadedCVs/` directory

### Frontend Configuration

**API URL**: Update in `js/cvParser.js`:
```javascript
const API_BASE_URL = 'http://localhost:5240/api';
```

## Important Notes

### CV File Storage

- **The CV file is saved separately** on the server in the `UploadedCVs/` directory
- **The JSON response does NOT contain** the CV file, PDF, DOCX, or base64 content
- **The `cv_saved: true` field** indicates the CV has been stored for later retrieval
- Files are named with timestamp: `filename_20260107063000.pdf`

### Data Privacy

- CVs contain sensitive personal information
- Implement proper authentication/authorization in production
- Consider encrypting stored CV files
- Add data retention policies

### Limitations

- **PDF/DOCX Parsing**: Currently requires additional libraries
  - For PDF: Use iTextSharp or PdfPig
  - For DOCX: Use DocumentFormat.OpenXml
- **Text-only mode** works fully out of the box

## Extending the Parser

### Adding New Skills

Edit `CvParserService.cs`:
```csharp
private static readonly string[] SkillKeywords = new[]
{
    "Flutter", "React", "YourNewSkill", ...
};
```

### Adding New Languages

Edit `CvParserService.cs`:
```csharp
private static readonly string[] LanguageKeywords = new[]
{
    "English", "Arabic", "YourNewLanguage", ...
};
```

### Custom Parsing Rules

Modify methods in `CvParserService.cs`:
- `ExtractName()`
- `ExtractEmail()`
- `ExtractSkills()`
- etc.

## Production Deployment

### Security Enhancements

1. Add authentication/authorization
2. Implement rate limiting
3. Add file size validation (already at 10MB)
4. Scan uploaded files for malware
5. Encrypt sensitive data at rest

### Performance Optimization

1. Add caching for parsed results
2. Use background jobs for large file processing
3. Implement database storage for results
4. Add pagination for large datasets

### PDF/DOCX Support

Install required NuGet packages:
```bash
dotnet add package itext7
dotnet add package DocumentFormat.OpenXml
```

Update `ExtractTextFromFile()` method with actual extraction logic.

## Troubleshooting

### Backend Not Starting

- Check if port 5240 is available
- Verify .NET SDK is installed
- Check for compilation errors

### Frontend Can't Connect

- Verify backend is running
- Check API_BASE_URL in `cvParser.js`
- Look for CORS errors in browser console
- Ensure browser allows localhost requests

### Parsing Issues

- Check CV text format
- Verify CV contains standard sections
- Review browser console for errors
- Test with example CV text provided

## Example CV Format

```
John Smith
Email: john.smith@example.com
Phone: +1-234-567-8900

PROFESSIONAL SUMMARY
Senior Software Developer with 5+ years of experience

TECHNICAL SKILLS
- Programming: Flutter, .NET, C#, JavaScript, React
- Databases: SQL, MongoDB
- Cloud: AWS, Azure

EXPERIENCE
Senior Developer | Tech Company (2018 - Present)
- Led development of mobile applications
- Implemented CI/CD pipelines

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2018

CERTIFICATIONS
- AWS Certified Developer - Associate
- Microsoft Certified: Azure Developer

LANGUAGES
- English (Native)
- Spanish (Fluent)
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console logs
3. Check backend logs
4. Verify API endpoints with Swagger UI: `http://localhost:5240/swagger`

## License

This CV Parser system is part of the FriendsLinks project.

---

**Created**: January 2026  
**Last Updated**: January 7, 2026
