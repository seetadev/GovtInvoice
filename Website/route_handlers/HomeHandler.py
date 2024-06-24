from flask import redirect, session

class HomeHandler:
    @staticmethod
    def get():
        if 'user' not in session:
            return redirect("/login")
        return redirect("/save")
        #self.render("sheetshome.html")
        #self.render("testtouch.html")