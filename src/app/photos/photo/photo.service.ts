import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {of, throwError} from 'rxjs';

import {Photo} from './photo';
import {PhotoComment} from './photo-comment';

const API = 'http://localhost:3000';

@Injectable({providedIn: 'root'})
export class PhotoService {

  constructor(private http: HttpClient) {
  }

  listFromUser(userName: string) {
    return this.http
      .get<Photo[]>(API + '/' + userName + '/photos');
  }

  listFromUserPaginated(userName: string, page: number) {
    const params = new HttpParams()
      .append('page', page.toString());

    return this.http
      .get<Photo[]>(API + '/' + userName + '/photos', {params});
  }

  upload(description: string, allowComments: boolean, file: File) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('allowComments', allowComments ? 'true' : 'false');
    formData.append('imageFile', file);

    return this.http.post(
      API + '/photos/upload',
      formData,
      {
        observe: 'events',
        reportProgress: true
      }
    );
  }

  findById(photoId: number) {
    return this.http.get<Photo>
    (API + '/photos/' + photoId);
  }

  getComments(photoId: number) {
    return this.http.get<PhotoComment[]>
    (API + '/photos/' + photoId + '/comments');
  }

  addComment(photoId: number, commentText: string) {
    return this.http.post(API + '/photos/' + photoId + '/comments', {commentText});
  }

  removePhoto(photoId: number) {
    return this.http.delete(API + '/photos/' + photoId);
  }

  /*Para rer acesso na resposta ao cabeçalho ou status da requisição, é necessário implementar um terceiro paramento
  * {observe: 'response'}
  *
  // tslint:disable-next-line:max-line-length
  * O método like() irá retornar um observable true ou false. True, é se conseguimos curtir a foto, false é se o erro de código de status 304 foi disparado
  * */
  like(photoId: number) {
    return this.http.post(
      API + '/photos/' + photoId + '/like', {}, {observe: 'response'})
    // se o like for um sucesso retorna true
      .pipe(map(res => true))
      // se ocorrer um erro eu primeiro verifico se o erro é 304 (cai na faixa de erro no Angular), se for um erro do tipo 304 eu retorno
      // um observable do tipo boolean, se for um erro diferente do 304 eu deixo o erro ser apresentado pelo throwError
      .pipe(catchError(err => {
        return err.status === '304' ? of(false) : throwError(err);
      }));
  }


}
