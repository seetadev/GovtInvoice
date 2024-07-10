from flask import request, jsonify, send_file, make_response
import logging
import os
import random
import string
import json
import time
import subprocess
from cloud.storage.storage import existsItem,getItem

class HtmlToPdfHandler:
    def __init__(self):
        self.base_path = "excelinterop/tmp/tmp"
        self.preview_path = os.path.join(self.base_path, "preview")

    def exists_in_storage(self, fname):
        return existsItem(fname, "aspiring-pdf-files")

    def get_from_storage(self, fname):
        return getItem(fname, "aspiring-pdf-files")

    def get_random_string(self, size):
        char_set = string.ascii_uppercase + string.digits
        return ''.join(random.sample(char_set, size))

    def get(self):
        logging.info("in htmltopdf converter get")
        fname = request.args.get('fname')
        action = request.args.get('action', default=None)
        
        if action == "preview":
            fullfname = os.path.join(self.preview_path, fname)
            inpfile = fullfname + ".pdf"
            logging.info(f"fname={inpfile}")

            if os.path.exists(inpfile):
                logging.info(f"found {fname} on disk")
                return send_file(inpfile, mimetype="application/pdf")
            else:
                return "Not Found", 404

        fullfname = os.path.join(self.base_path, fname)
        inpfile = fullfname + ".pdf"
        logging.info(f"fname={inpfile}")

        if os.path.exists(inpfile):
            logging.info(f"found {fname} on disk")
            return send_file(inpfile, mimetype="application/pdf")
        else:
            data = self.get_from_storage(fname)
            if data:
                logging.info(f"found {fname} in s3")
                response = make_response(data)
                response.headers.set('Content-Type', 'application/pdf')
                return response
            else:
                return "Not Found", 404

    def post(self):
        logging.info("in htmltopdf converter post")
        action = request.form.get('action', default=None)
        
        if action == "preview":
            while True:
                fname = self.get_random_string(20)
                fullfname = os.path.join(self.preview_path, fname)
                if not os.path.exists(fullfname):
                    break
        else:
            while True:
                fname = self.get_random_string(20)
                fullfname = os.path.join(self.base_path, fname)
                if not os.path.exists(fullfname) and not self.exists_in_storage(fname):
                    break

        if action == "send":
            uuid = request.form.get('uuid', default=None)
            appname = request.form.get('appname', default=None)
            filename = request.form.get('filename', default=None)
            created = time.strftime("%Y:%m:%d %H:%M:%S")
            jsondata = {"uuid": uuid, "appname": appname, "filename": filename, "created": created}
            jsonstr = json.dumps(jsondata)
            jsonfile = fullfname + ".json"
            with open(jsonfile, "w") as f:
                f.write(jsonstr)

        inpfile = fullfname + ".html"
        content = request.form.get('content')

        with open(inpfile, "w") as f:
            f.write(content)

        outfile = fullfname + ".pdf"
        logging.info(outfile)
        logging.info(inpfile)
        cmdname = "wkhtmltopdf"
        subprocess_output = subprocess.getoutput(f"{cmdname} {inpfile} {outfile}")

        pdfurl = f"http://{request.host}/htmltopdf?fname={fname}&action={action}" if action else f"http://{request.host}/htmltopdf?fname={fname}"
        return jsonify(pdfurl=pdfurl, result="ok")