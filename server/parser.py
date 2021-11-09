import sys
import os
import PyPDF2
from docx2python import docx2python

if __name__ == "__main__":
    filename = sys.argv[1]
    parsedData = ''
    pathName = f'./temp/{filename}'
    if filename.endswith('.txt'):
        with open(pathName, encoding='utf8') as f:
            for line in f:
                parsedData = parsedData + line
    elif filename.endswith('.pdf'):
        pdfFileObj = open(pathName, 'rb')
        pdfReader = PyPDF2.PdfFileReader(pdfFileObj)
        for x in range(pdfReader.numPages):
            pageObject = pdfReader.getPage(x)
            parsedData = parsedData + pageObject.extractText()
        pdfFileObj.close()
    elif filename.endswith('.doc') or filename.endswith('.docx'):
        doc_result = docx2python(pathName)
        parsedData = doc_result.text
    else:
        parsedData = 'Unsupported Filetype'
    print(parsedData)
    sys.stdout.flush()
    os.remove(pathName)