from flask import  request, Response
import codecs
import subprocess
import logging

def capitalize_first_letter(word):
    if len(word) > 0:
        return word[0].upper() + word[1:]
    else:
        return word  # Return empty string if input is empty

contenttypes = {
    "MSC": "text/plain",
    "MSCE": "text/plain",
    "HTML": "text/html",
    "PDF": "application/pdf",
    "Excel2007": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Excel5": "application/vnd.ms-excel",
    "CSV": "text/plain",
    "ODS": "application/vnd.oasis.opendocument.spreadsheet"
}

suffix = {
    "MSC": "msc",
    "MSCE": "msce",
    "HTML": "html",
    "PDF": "pdf",
    "Excel2007": "xlsx",
    "Excel5": "xls",
    "CSV": "csv",
    "ODS":"ods"
}


class DownloadFileHander:
    @staticmethod
    def post():
        type = request.form.get('type')
        content = request.form.get('content')

        if type not in ["MSC", "MSCE", "HTML", "PDF"]:
            fullfname = "excelinterop/tmp/tmp"
            inpfile = fullfname + ".b"

            with codecs.open(inpfile, encoding='utf-8', mode="w") as f:
                f.write(content)
            outfile = fullfname + "." + suffix.get(type, "txt")
            logging.info(outfile)
            logging.info(inpfile)
            cmdname = "excelinterop/export.php"
            writer = capitalize_first_letter(suffix.get(type, "txt"))
            output = subprocess.getoutput(f"php {cmdname} {inpfile} {outfile} {writer}")
            logging.info(output)

            with open(outfile, 'rb') as f:
                content = f.read()

        elif type == "PDF":
            logging.info("type is PDF")
            fullfname = "excelinterop/tmp/tmp"
            inpfile = fullfname + ".html"

            with codecs.open(inpfile, encoding='utf-8', mode="w+") as f:
                f.write(content)

            outfile = fullfname + "." + suffix.get(type, "pdf")
            logging.info(outfile)
            logging.info(inpfile)
            cmdname = "wkhtmltopdf"
            output = subprocess.getoutput(f"{cmdname} {inpfile} {outfile}")
            logging.info(output)

            with open(outfile, 'rb') as f:
                content = f.read()

        else:
            # This assumes the content is directly returned if it's a supported type without conversion
            content = content.encode('utf-8')

        response = Response(content)
        response.headers['Content-Type'] = contenttypes.get(type, 'application/octet-stream')
        response.headers['Content-Disposition'] = f'attachment; filename="tmp.{suffix.get(type, "txt")}"'
        response.headers['Cache-Control'] = 'max-age=0'

        return response