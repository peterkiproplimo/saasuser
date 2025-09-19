import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  private gotenbergUrl = 'https://dyerandblair-gotenberg.Techsavanna.co.ke/forms/chromium/convert/html';
  private http = inject(HttpClient);

  generatePdf(htmlContent: string): Observable<Blob> {
    const formData: FormData = new FormData();
    formData.append('files', new Blob([htmlContent], { type: 'text/html' }), 'index.html');

    // Additional options like margins can be passed as needed
    formData.append('options', JSON.stringify({
      marginTop: '0mm',
      marginBottom: '0mm',
      marginLeft: '0mm',
      marginRight: '0mm',
    }));

    return this.http.post(this.gotenbergUrl, formData, {
      headers: new HttpHeaders({}),
      responseType: 'blob',
    });
  }
}
