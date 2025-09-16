import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add headers for Facebook API requests
    if (req.url.includes('graph.facebook.com')) {
      const apiRequest = req.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      return next.handle(apiRequest).pipe(
        retry(1), // Retry once on failure
        catchError((error: HttpErrorResponse) => {
          console.error('Facebook API Error:', error);

          // Handle specific Facebook API errors
          if (error.status === 0) {
            // CORS or network error
            console.error('CORS or network error - may need proxy configuration');
          }

          return throwError(() => error);
        })
      );
    }

    // For other requests, proceed normally
    return next.handle(req);
  }
}