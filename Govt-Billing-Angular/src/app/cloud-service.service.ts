import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
let BASE_URL = "http://aspiringapps.com/api";
// import "rxjs/add/operator/map";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CloudServiceService {
  constructor(private http: HttpClient) {
    console.log("Cloud service entered");
  }
  createPDF(content: any) {
    // alert(content);
    let url = BASE_URL + "/htmltopdf";
    // alert(url);
    let body = JSON.stringify({ content: content });
    const headers = new HttpHeaders().set("content-type", "application/json");
    // let headers = new Headers({ "Content-Type": "application/json" });
    // const options = {
    //   headers: new HttpParams().set('headers', headers);
    // }
    // options.params.set('headers', headers);
    // new Requestopt({ headers: headers });

    // map
    return this.http
      .post(url, body, { headers: headers })
      .pipe(map((res: { json: () => any }) => res.json()));
  }
  auth(data: any, action: string) {
    let url = BASE_URL + "/" + action;
    let body = JSON.stringify({ data: data });
    // let headers = new Headers({ "Content-Type": "application/json" });
    // let options = new RequestOptions({ headers: headers });

    // return this.http.post(url, body, options).map((res) => res.json());
    const headers = new HttpHeaders().set("content-type", "application/json");

    return this.http
      .post(url, body, { headers: headers })
      .pipe(map((res: { json: () => any }) => res.json()));
  }
  logout() {
    let url = BASE_URL + "/logout";
    // let headers = new Headers({ "Content-Type": "application/json" });
    // let options = new RequestOptions({ headers: headers });

    // return this.http.post(url, "", options).map((res) => res.json());
    const headers = new HttpHeaders().set("content-type", "application/json");

    return this.http
      .post(url, "", { headers: headers })
      .pipe(map((res: { json: () => any }) => res.json()));
  }

  saveToServer(data: { appname: string; filename: any; content: string }) {
    let url = BASE_URL + "/save";
    let body = JSON.stringify({ data: data });
    // let headers = new Headers({ "Content-Type": "application/json" });
    // let options = new RequestOptions({ headers: headers });

    // return this.http.post(url, body, options).map((res) => res.json());
    const headers = new HttpHeaders().set("content-type", "application/json");

    return this.http
      .post(url, body, { headers: headers })
      .pipe(map((res: { json: () => any }) => res.json()));
  }
  listFiles(appname: string) {
    let url = BASE_URL + "/list";
    // let params: URLSearchParams = new URLSearchParams();
    // params.set("appname", appname);
    return this.http
      .get(url, {
        params: {
          appname: appname,
        },
      })
      .pipe(map((res: { json: () => any }) => res.json()));
  }

  saveMultiple(appname: any, data: any) {
    let url = BASE_URL + "/saveMutiple";
    let body = JSON.stringify({ appname: appname, data: data });
    // let headers = new Headers({ "Content-Type": "application/json" });
    // let options = new RequestOptions({ headers: headers });

    // return this.http.post(url, body, options).map((res) => res.json());
    const headers = new HttpHeaders().set("content-type", "application/json");

    return this.http
      .post(url, body, { headers: headers })
      .pipe(map((res: { json: () => any }) => res.json()));
  }
  moveLocal(appname: any, args: any) {
    let url = BASE_URL + "/moveLocal";
    // let params: URLSearchParams = new URLSearchParams();
    // params.set("appname", appname);
    // params.set("args", args);
    return this.http
      .get(url, {
        params: {
          appname: appname,
          args: args,
        },
      })
      .pipe(map((res: { json: () => any }) => res.json()));
    // return this.http.get(url, { search: params }).map((res) => res.json());
  }
  deleteFile(filename: any, appname: any) {
    // let headers = new Headers({ "Content-Type": "application/json" });
    // let options = new RequestOptions({ headers: headers });
    const headers = new HttpHeaders().set("content-type", "application/json");

    return this.http
      .delete(`${BASE_URL}/delete?appname=${appname}&filename=${filename}`, {
        headers: headers,
      })
      .pipe(map((res: { json: () => any }) => res.json()));
  }

  restore(appname: string, key: string) {
    let url = BASE_URL + "/purchases";
    // let params: URLSearchParams = new URLSearchParams();
    // params.set("appname", appname);
    // params.set("key", key);
    return this.http
      .get(url, {
        params: {
          appname: appname,
          key: key,
        },
      })
      .pipe(map((res: { json: () => any }) => res.json()));

    // .map((res) => res.json());
  }
  handleError(error: { error: any }) {
    console.error(JSON.stringify(error));
    return Observable.throw(error.error || "Server error");
  }

  putLogoURL(appname: string, content: string) {
    let suffix = "jpeg";
    let url = BASE_URL + "/logo";
    let body = JSON.stringify({ content: content, suffix: suffix });
    // let headers = new Headers({ "Content-Type": "application/json" });
    // let options = new RequestOptions({ headers: headers });

    // return this.http.post(url, body, options).map((res) => res.json());
    const headers = new HttpHeaders().set("content-type", "application/json");

    return this.http
      .post(url, body, { headers: headers })
      .pipe(map((res: { json: () => any }) => res.json()));
  }
}
