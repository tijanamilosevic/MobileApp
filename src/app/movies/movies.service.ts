import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Movie} from './movie.model';
import {BehaviorSubject} from "rxjs";
import {map, switchMap, take, tap} from "rxjs/operators";
import {UserService} from "../user.service";
import {AuthService} from "../auth/auth.service";
interface MovieData {
  id: string;
  naziv: string;
  zanr: string;
  glumci: string;
  ocena: any;
  datum: any;
  komentar: string;
  reziser: string;
  trajanje: any;
  zemlja: string;
  godina: number;
  userId: string;
}
@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  private _movies = new BehaviorSubject<Movie[]>([]);
  movieData: Movie;
  constructor(private http: HttpClient, private user: UserService, private authService: AuthService) { }

  get movies(){
    return this._movies.asObservable();
  }

  getMovies(){

      return this.authService.token.pipe(
          take(1),
          switchMap((token) => {
              return this.http
                  .get<{ [key: string]: MovieData }>(
                      `https://moviemobileapp-b3eae.firebaseio.com/mojiFilmovi.json?auth=${token}`
                  );
          }),
          map((movieData) => {
              console.log(movieData);
              const movies: Movie[] = [];
              for (const key in movieData) {
                  if (movieData.hasOwnProperty(key)) {
                      movies.push(
                          new Movie(
                              key,
                              movieData[key].naziv,
                              movieData[key].glumci,
                              movieData[key].reziser,
                              movieData[key].zanr,
                              movieData[key].godina,
                              movieData[key].trajanje,
                              movieData[key].datum,
                              movieData[key].ocena,
                              movieData[key].komentar,
                              movieData[key].zemlja,
                              movieData[key].userId


                          ));
                  }
              }
              const mojiFilmovi: Movie[] = [];
              for(let movie of movies) {
                  if( movie.userId === this.user.getUserID()){
                      mojiFilmovi.push(movie)
                  }
              }
              return mojiFilmovi;
          }),
          tap(mojiFilmovi => {
              this._movies.next(mojiFilmovi);
          })
      );
      // stari nacin
    // return this.http
    //     .get<{ [key: string]: MovieData }>(
    //         `https://moviemobileapp-b3eae.firebaseio.com/users/` + userID + `/mojiFilmovi.json`
    //     ).pipe(map(movieData =>{
    //       console.log(movieData);
    //       const movies : Movie[] = [];
    //       for(const key in movieData){
    //         if(movieData.hasOwnProperty(key)){
    //           movies.push({
    //             id: key,
    //             naziv: movieData[key].naziv,
    //             zanr: movieData[key].zanr,
    //             ocena: movieData[key].ocena,
    //             zemlja: movieData[key].zemlja,
    //             komentar: movieData[key].komentar,
    //             glumci: movieData[key].glumci,
    //             reziser: movieData[key].reziser,
    //             datum: movieData[key].datum,
    //             trajanje: movieData[key].trajanje,
    //             godina: movieData[key].trajanje
    //           });
    //         }
    //       }
    //       this._movies.next(movies); //premesti ovo ispod, koristi tap
    //       return movies;
    //     }));
  }

  getMovie(id: string, userID: string){
      return this.authService.token.pipe(
          take(1),
          switchMap((token) => {
              return this.http
                  .get<MovieData>(`https://moviemobileapp-b3eae.firebaseio.com/mojiFilmovi/${id}.json?auth=${token}`);
          }),
          map((resData) => {
              console.log(resData);
              return new Movie(
                  id,
                  resData.naziv,
                  resData.glumci,
                  resData.reziser,
                  resData.zanr,
                  resData.godina,
                  resData.trajanje,
                  resData.datum,
                  resData.ocena,
                  resData.komentar,
                  resData.zemlja,
                  resData.userId

              );
          })
      );
      // stari nacin
   // return this.http
   //     .get<MovieData>(`https://moviemobileapp-b3eae.firebaseio.com/users/` + userID + `/mojiFilmovi/${id}.json`)
   //     .pipe(map((resData: MovieData)=> {
   //       console.log(resData);
   //       return {
   //           id,
   //           naziv: resData.naziv,
   //           datum: resData.datum,
   //           ocena: resData.ocena,
   //           komentar: resData.komentar,
   //           reziser: resData.reziser,
   //           glumci: resData.glumci,
   //           zemlja: resData.zemlja,
   //           trajanje: resData.trajanje,
   //           zanr: resData.zanr,
   //           godina: resData.godina
   //
   //       }}
   //     ));
  }
    addMovie( naziv: string, glumci: string, reziser: string, zanr: string, godina: number, trajanje: number,
              datum: string, ocena: number, komentar: string, zemlja: string) {
        let noviId;
        let noviFilm: Movie;
        let fetchedUserId: string;

      return this.authService.userId.pipe(
            take(1),
            switchMap(userId => { // jer menjamo observable
                fetchedUserId = userId;
                return this.authService.token;
            }),
            take(1),
            switchMap((token) => {
                noviFilm = new Movie(
                    null,
                    naziv,
                    glumci,
                    reziser,
                    zanr,
                    godina,
                    trajanje,
                    datum,
                    ocena,
                    komentar,
                    zemlja,
                    fetchedUserId

                );

                return this.http
                    .post<{ name: string }>(
                        `https://moviemobileapp-b3eae.firebaseio.com/mojiFilmovi.json?auth=${token}`,
                        noviFilm
                    );
            }),
            switchMap((resData) => {
                noviId = resData.name;
                return this.movies;
            }),
            take(1),
            tap((movies) => {
                noviFilm.id = noviId;
                this._movies.next(
                    movies.concat(noviFilm)
                );
            })
        )

         // stari nacin:
      // return this.http
      //       .post<{ name: string }>(
      //           `https://moviemobileapp-b3eae.firebaseio.com/users/`+ this.user.getUserID() + `/mojiFilmovi.json`,
      //           { naziv, glumci, reziser, zanr,  godina, trajanje, datum, ocena, komentar,zemlja }
      //
      //       );

    }
  deleteMovie(movieID: string) {
      return this.authService.token.pipe(
          take(1),
          switchMap((token) => {
              return this.http
                  .delete(`https://moviemobileapp-b3eae.firebaseio.com/mojiFilmovi/${movieID}.json?auth=${token}`);
          }),
          switchMap(() => {
              return this.movies;
          }),
          take(1),
          tap((movies) => {
              this._movies.next(movies.filter((film) => film.id !== movieID));
          })
      );
      //stari nacin
   // return this.http.delete(`https://moviemobileapp-b3eae.firebaseio.com/users/` + userID + `/mojiFilmovi/${movieID}.json`)
   //      .pipe(switchMap(()=> {
   //        return this.movies
   //      }),
   //          take(1),
   //          tap((movies) => {
   //           this._movies.next(movies.filter(film => film.id! == movieID));
   //          })
   //      );
  }

  editMovie(movieID: string, userId: string, naziv: string, trajanje: any, zanr: string, zemlja: string,
            glumci: string, ocena: any, datum: string, komentar: string, reziser: string, godina: number) {

      return this.authService.token.pipe(
          take(1),
          switchMap((token) => {
              return this.http
                  .put(`https://moviemobileapp-b3eae.firebaseio.com/mojiFilmovi/${movieID}.json?auth=${token}`, {
                      naziv,
                      glumci,
                      reziser,
                      zanr,
                      godina,
                      trajanje,
                      datum,
                      ocena,
                      komentar,
                      zemlja,
                      userId

                  });
          }),
          switchMap(() => this.movies),
          take(1),
          tap((movies) => {
              const updatedMovieIndex = movies.findIndex((m) => m.id === movieID);
              const updatedMovies = [...movies];
              updatedMovies[updatedMovieIndex] = new Movie(
                  movieID,
                  naziv,
                  glumci,
                  reziser,
                  zanr,
                  godina,
                  trajanje,
                  datum,
                  ocena,
                  komentar,
                  zemlja,
                  '1'
              );
              this._movies.next(updatedMovies);
          })
      );
      // stari nacin
    // return this.http.put(`https://moviemobileapp-b3eae.firebaseio.com/users/` + userID + `/mojiFilmovi/${movieID}.json`, {
    //   naziv, trajanje, zanr, zemlja, glumci, ocena, datum, komentar, reziser, godina
    // }).pipe(switchMap(()=> {
    //   return this.movies
    // }),
    //     take(1),
    //     tap((movies)=> {
    //       const updatedMovieIndex = movies.findIndex((m)=> m.id === movieID);
    //       const updatedMovies = [...movies]; // kloniranje niza
    //       updatedMovies[updatedMovieIndex] = {
    //         id: movieID,
    //         naziv,
    //         trajanje,
    //         zanr,
    //         zemlja,
    //         glumci,
    //         ocena,
    //         datum,
    //         komentar,
    //         reziser,
    //         godina
    //       };
    //       this._movies.next(updatedMovies);
    //     }));
  }

  // .pipe(
  //         map((quotesData) => {
  //           console.log(quotesData);
  //           const quotes: Quote[] = [];
  //           for (const key in quotesData) {
  //             if (quotesData.hasOwnProperty(key)) {
  //               quotes.push({
  //                 id: key,
  //                 author: quotesData[key].author,
  //                 text: quotesData[key].text,
  //                 imageUrl:
  //                   "https://ideas.staticsfly.com/ideas/wp-content/uploads/2016/04/graduation-quote_college_nora-ephron.jpg",
  //               });
  //             }
  //           }
  //
  //           this._quotes.next(quotes);
  //           return quotes;
  //         })
  // primer koriscenja REST API-ja cloud database-a :)
// https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/cities/LA

  //test rute POST zahteva sa nekiim bzvz podacima
  // addMovie(userID: string){
  //   return this.http
  //       .post<{ name: string }>(
  //           `https://moviemobileapp-b3eae.firebaseio.com/users/` + userID + `/mojiFilmovi.json`,//radi ruta!
  //           { author: "test", text: "test text" }
  //       );
  // }
}
