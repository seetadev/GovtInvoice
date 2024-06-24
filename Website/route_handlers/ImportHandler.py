from flask import request, render_template, make_response
import logging
import string
import random
import subprocess

channels = {}
sessionfileuploads = {}

def get_random_string(size):
    char_set = string.ascii_uppercase + string.digits
    return ''.join(random.sample(char_set, size))

class MessageMixin:
    def __init__(self, session, sheetstr, sheetmscestr):
        self.session = session
        self.sheetstr = sheetstr
        self.sheetmscestr = sheetmscestr

class ImportHandler:
    @staticmethod
    def get():
        session = get_random_string(6)
        logging.info(f"session is {session}")
        
        resp = make_response(render_template('importcollab.html', entry={
            'fname': 'test',
            'sheetstr': '',
            'sheetmscestr': '',
            'session': session
        }))
        resp.set_cookie('session', session)
        resp.set_cookie('idinsession', '1')
        
        channels[session] = MessageMixin(session, "", "")
        return resp

    def post():
        session = request.cookies.get('session')
        upload_file = request.files['upload']
        fname = upload_file.filename
        fcontent = upload_file.read()

        if fname[-3:] != "msc" and fname[-4:] != "msce":
            fullfname = f"excelinterop/tmp/{fname}"
            with open(fullfname, 'wb') as f:
                f.write(fcontent)
            
            cmdname = "excelinterop/import.php"
            output = subprocess.getoutput(f"php {cmdname} {fullfname}")
            i = output.index("$---$")
            wbook = output[i + 5:]
        else:
            wbook = fcontent.decode('utf-8')

        sessionfileuploads[fname] = wbook

        resp = make_response(render_template('importcollabload.html', entry={
            'fname': fname,
            'sheetmscestr': wbook if fname[-4:] == 'msce' else '',
            'sheetstr': '' if fname[-4:] == 'msce' else wbook,
            'session': session
        }))
        resp.set_cookie('idinsession', '1')
        
        return resp
        

