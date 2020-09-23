const screen_w = window.screen.width
const aside = document.getElementById('aside')
const aside_img = document.getElementById('aside-img')
const header = document.getElementById('header')
const main = document.getElementById('main')
const login_error = document.getElementById('login-error')


if(screen_w < 700) {
    // Aside response
    aside.classList.add('aside--response')
    login_error.classList.add('form-container__text-error--response')

    // Main response
    main.classList.add('main--response')

    const movie_poster = document.getElementById('movie-poster')
    movie_poster.parentElement.classList.add('movie-section__movie--response')
}

window.addEventListener('load', ()=>{
    const loader_page = document.getElementById('loading-container')
    loader_page.classList.add('loading-container--finish')
})

const login_form = document.getElementById('login')
const login_username = document.getElementById('login-username')
const login_password = document.getElementById('login-password')
const login_submit = document.getElementById('login-submit')
const submit_loading = document.getElementById('submit-loading')

// Placeholder
login_username.addEventListener('focus', ()=>{
    if(login_username.classList.contains('login__inputs')){
        login_username.value = ''
        login_username.classList.replace('login__inputs', 'login__inputs--active')
    }

})

login_username.addEventListener('blur', ()=>{
    if(login_username.classList.contains('login__inputs--active') && login_username.value == ''){
        login_username.value = 'username'
        login_username.classList.replace('login__inputs--active', 'login__inputs')
    }
})

login_password.addEventListener('focus', ()=>{
    if(login_password.classList.contains('login__inputs')){
        login_password.value = ''
        login_password.classList.replace('login__inputs', 'login__inputs--active')
        login_password.type = 'password'
    }

})

login_password.addEventListener('blur', ()=>{
    if(login_password.classList.contains('login__inputs--active') && login_password.value == ''){
        login_password.value = 'password'
        login_password.classList.replace('login__inputs--active', 'login__inputs')
        login_password.type = 'text'
    }
})

// Validation & sending
const login_inputs = {
    username: false,
    password: false
}

const validation = async (input)=>{
    const value = input.value
    let regEx = /^\w{2,}[\s\w*]*$/gi
    const test = regEx.test(value)

    if(test) return input
    else throw new Error()
}

const validationSuccess = (input)=>{
    input.classList.contains('login__inputs--unsuccess') ? 
    input.classList.replace('login__inputs--unsuccess', 'login__inputs--success') : 
    input.classList.add('login__inputs--success')
    input.name == 'username' ? login_inputs.username = true : login_inputs.password = true
}

const validationUnsuccess = (input)=>{
    input.classList.contains('login__inputs--success') ? 
    input.classList.replace('login__inputs--success', 'login__inputs--unsuccess') : 
    input.classList.add('login__inputs--unsuccess')
    input.name == 'username' ? login_inputs.username = false : login_inputs.password = false
    
    loginError("Username or password is wrong. Put only valid characters")
}

const setSubmitButton = ()=>{
    setTimeout(() => {
        submit_loading.classList.remove('submit__loading--submit')
        login_submit.classList.remove('login__submit--submit')
    }, 500);
}

const loginError = (text)=>{
    const login_error = document.getElementById('login-error')
    login_error.classList.add('form-container__text-error--active')
    setTimeout(() => {
        login_error.firstElementChild.textContent = text.toUpperCase()
    }, 300);
    setSubmitButton()
}

const openDataBase = (data, data_text)=>{
    const idb = indexedDB
    
    if(idb){
        let db
        const request = idb.open('UserList', 1)

        request.onsuccess = ()=>{
            db = request.result
            if(data && data_text != 'removeFavourite') {
                data.hasOwnProperty('Title') ?
                setFavouriteList() :
                getUser()
            }
            else if(data) removeFavourite()
            else getUserActive()
        }

        request.onupgradeneeded = ()=>{
            db = request.result

            const object_store = db.createObjectStore('USERS', {
                keyPath: 'username'
            })

            const object_store2 = db.createObjectStore('USERACTIVE', {
                keyPath: 'username'
            })
        }

        request.onerror = ()=> {
            loginError("Can't access to database")
        }

        const setUserActive = (data)=>{
            const transaction = db.transaction('USERACTIVE', 'readwrite')
            const object_store = transaction.objectStore('USERACTIVE')
            const request = object_store.add(data)
        }

        const getUserActive = ()=>{
            const transaction = db.transaction('USERACTIVE', 'readwrite')
            const object_store = transaction.objectStore('USERACTIVE')
            const request = object_store.openCursor()
        
            request.onsuccess = (e)=> {
                const cursor = e.target.result
                if(cursor){
                    openWebsite(cursor.value.username, true)
                }
            }
        }

        const deleteUserActive = async()=>{
                try{
                    const transaction = await db.transaction('USERACTIVE', 'readwrite')
                    const object_store = await transaction.objectStore('USERACTIVE')
                    const request = await object_store.clear()
                    
                    await setTimeout(() => {
                         location.href = location.href
                         location.reload()
                    }, 1000);
                }catch{
                    return deleteUserActive()
                }
        }

        const getUser = ()=>{
            const transaction = db.transaction('USERS', 'readwrite')
            const object_store = transaction.objectStore('USERS')
            const request = object_store.openCursor(data.username)
        
            request.onsuccess = (e)=> {
                const cursor = e.target.result
                if(cursor && cursor.value.password == data.password){
                    openWebsite(data.username)
                    setUserActive(data)
                }
                else if(cursor && cursor.value.password != data.password) loginError(`The user exist but Password's wrong`)
                else newUser(data)
            }
        }

        const newUser = (data)=>{
            const transaction = db.transaction('USERS', 'readwrite')
            const object_store = transaction.objectStore('USERS')
            const request = object_store.add(data)
            
            setUserActive(data)
            openWebsite(data.username)
        }

        const openWebsite = (data) => {
            submit_loading.firstElementChild.classList.add('fa-spinner--finish')

            const aside = document.getElementById('aside')
            aside.classList.add('aside-footer--load')

            const footer = document.getElementById('footer')
            footer.classList.add('aside-footer--load')

            const header = document.getElementById('header')
            header.classList.add('header--load')

            const main = document.getElementById('main')
            main.classList.add('main--load')

            // header titles
            const log_out_logo = document.getElementById('log-out')

            log_out_logo.parentElement.addEventListener('click', ()=>{
                deleteUserActive()
            })

            // Setting User button
            const button = document.getElementById('user-button')         
            const user_options = document.getElementById('user-options')

            button.textContent = data

            button.addEventListener('click', () =>{
                user_options.classList.contains('nav__user-options--on') ?
                user_options.classList.remove('nav__user-options--on') :
                user_options.classList.add('nav__user-options--on')
            })

            document.body.addEventListener('click', (e)=>{
                if(user_options.classList.contains('nav__user-options--on') &&
                    e.target != button &&
                    e.target != user_options) user_options.classList.remove('nav__user-options--on')
            })

            // Set favourites
            const transaction = db.transaction('USERS', 'readwrite')
            const object_store = transaction.objectStore('USERS')
            const request = object_store.openCursor(data)

            request.onsuccess = (e) => {
                const favourites = e.target.result.value.favourites

                for(const f_element of favourites){
                    addFavourite(f_element, true)
                }
            }
        }

        const setFavouriteList = () => {
            let user_username
            
            const f_transaction = db.transaction('USERACTIVE', 'readwrite')
            const f_object_store = f_transaction.objectStore('USERACTIVE')
            const f_request = f_object_store.openCursor()
            
            f_request.onsuccess = (e)=> {
                user_username = e.target.result.value.username

                const cursor = e.target.result

                const update = cursor.value

                if(!update.hasOwnProperty('favourites')) update.favourites = [data]
                else {
                    if(!update.favourites.find(e => e.Title == data.Title)) update.favourites.push(data)
                }

                const request = cursor.update(update)
            }
            
            const s_transaction = db.transaction('USERS', 'readwrite')
            const s_object_store = s_transaction.objectStore('USERS')
            const s_request = s_object_store.openCursor(user_username)

            s_request.onsuccess = (e) => {
                const cursor = e.target.result

                const update = cursor.value

                if(!update.hasOwnProperty('favourites')) update.favourites = [data]
                else {
                    if(!update.favourites.find(e => e.Title == data.Title)) {
                        update.favourites.push(data)
                        addFavourite(data, true)
                    }
                }

                const request = cursor.update(update)
            }
        }

        const removeFavourite = ()=>{
            let user_username
            
            const f_transaction = db.transaction('USERACTIVE', 'readwrite')
            const f_object_store = f_transaction.objectStore('USERACTIVE')
            const f_request = f_object_store.openCursor()
            
            f_request.onsuccess = (e)=> {
                user_username = e.target.result.value.username

                const cursor = e.target.result

                const update = cursor.value
            
                const index = update.favourites.findIndex(e => e.Title == data.Title)
                update.favourites.splice(index, 1)

                const request = cursor.update(update)
            }
            
            const s_transaction = db.transaction('USERS', 'readwrite')
            const s_object_store = s_transaction.objectStore('USERS')
            const s_request = s_object_store.openCursor(user_username)

            s_request.onsuccess = (e) => {
                const cursor = e.target.result

                const update = cursor.value

                const index = update.favourites.findIndex(e => e.Title == data.Title)
                update.favourites.splice(index, 1)

                const request = cursor.update(update)
            }
        }
    }else loginError("Your browser hasn't indexeddb, try using other browser")
}

openDataBase()

const onSubmit = ()=>{
    // Load animation
    login_submit.classList.add('login__submit--submit')
    submit_loading.classList.add('submit__loading--submit')

    // Open website
    const user_data = {
        username: login_username.value,
        password: login_password.value
    }

    openDataBase(user_data)
}

login_username.addEventListener('change', (e)=>{
    validation(e.target)
        .then(res => validationSuccess(res))
        .catch(err => validationUnsuccess(e.target))
})

login_password.addEventListener('change', (e)=>{
    validation(e.target)
        .then(res => validationSuccess(res))
        .catch(err => validationUnsuccess(e.target))
})

login_form.addEventListener('submit', (e)=>{
    e.preventDefault()
    const formValues = Object.values(login_inputs)
    const valid = formValues.findIndex(value => value == false)

    if(valid == -1){
        onSubmit()
    }
})

    // Main website
// Searcher
const form_searcher = document.getElementById('form-searcher')
const searcher = document.getElementById('searcher')
const searcher_submit = document.getElementById('searcher-submit')

form_searcher.addEventListener('mouseenter', ()=>{
    if(!form_searcher.classList.contains('nav__search-container--on')) form_searcher.classList.add('nav__search-container--on') 
    
    if(!searcher.classList.contains('search-container__input--on')) searcher.classList.add('search-container__input--on')
    
    if(!searcher_submit.classList.contains('fa-search--on'))searcher_submit.classList.add('fa-search--on')
})

form_searcher.addEventListener('mouseleave', ()=>{
    if(!searcher.classList.contains('search-container__input--focus')){
        form_searcher.classList.remove('nav__search-container--on') 
        searcher.classList.remove('search-container__input--on')
        searcher.value = 'search'
        if(searcher_submit.classList.contains('fa-search--on')) searcher_submit.classList.remove('fa-search--on')
    }
})

searcher.addEventListener('focus', ()=>{
    if(searcher.value == 'search') searcher.value = ''
    searcher.classList.add('search-container__input--focus')
})

searcher.addEventListener('blur', ()=>{
    if(searcher.value == '') {
        searcher.value = 'search'
        searcher.classList.remove('search-container__input--focus')
    }
})

// Main
const movie_container = document.createElement('div')

movie_container.classList.add('main__movies-container')
movie_container.setAttribute('id', 'movies-container')

main.append(movie_container)

// Main movies
const setMainMovies = async(movie_title = 'superman')=>{
    try{
        const arr_movies = await movieRequest(movie_title)
        if(arr_movies.length > 0)newMovie(arr_movies)
    }catch{
        movie_container.innerHTML = '<p class = "movie-container__err">Error loading '+movie_title+', try again</p>'
    }
    
}

const movieRequest = async(title)=>{
    // to movies
    let g_arr
    let arr_movies
    let arr_series

    await axios({
        method: 'GET',
        url: `http://www.omdbapi.com/?s=${title}&type=movie&plot=full&apikey=9da1401c`
    }).then(res => checkDataMovie(res.data.Search))
        .then(res => arr_movies = res)

    await axios({
        method: 'GET',
        url: `http://www.omdbapi.com/?s=${title}&type=series&plot=full&apikey=9da1401c`
    }).then(res => checkDataMovie(res.data.Search))
        .then(res => arr_series = res)
    
    if(arr_movies != undefined && arr_series != undefined) g_arr = arr_movies.concat(arr_series) 
    else if(arr_movies != undefined) g_arr = arr_movies
    else g_arr = arr_series
    return g_arr
}

setMainMovies()

const checkDataMovie = (data) =>{
    const index_to_delete = []
    let num_to_rest = 0
    
    for(const index in data){
        if(Object.values(data[index]).includes('N/A')) index_to_delete.push(index)
    }
    
    for(index of index_to_delete){
        data.splice(index - num_to_rest, 1)
        num_to_rest++
    }

    return data
}

const newMovie = async(data)=>{
    //cleaning the main
    movie_container.innerHTML = "<i class='fas fa-spinner movie-container__load'></i>"

    // setting the main
    const fragment = document.createDocumentFragment()
    
    if(Array.isArray(data)){
        for(const movie_data of data){
            const movie_request = await getMovie(movie_data.imdbID)
    
            // making elements
            const movie = document.createElement('div')
            const movie_poster = document.createElement('img')
            const movie_info_container = document.createElement('div')
            const movie_info = document.createElement('div')
            const info_favourite = document.createElement('div')
            const add_favourite = document.createElement('i')
            const title = document.createElement('div')
            const plot = document.createElement('p')
    
        
            // Element's class
            movie.classList.add('movie-container__movie')
            movie_poster.classList.add('movie__poster')
            movie_info_container.classList.add('movie__info-container')
            info_favourite.classList.add('info-container__favourite')
            add_favourite.classList.add('far')
            add_favourite.classList.add('fa-bookmark')
            movie_info.classList.add('info-container__info')
            title.classList.add('info-container__title')
            plot.classList.add('info-container__plot')
            
            
            // Poster on
            movie_poster.setAttribute('src', movie_data.Poster)
            
            // Info on
            title.textContent = movie_data.Title
            plot.innerHTML = `
                <span class="plot__info">
                    <span class="space"></span>${movie_request.Rated} <br>
                    <span class="space"></span>${movie_request.Type.toUpperCase()} ${movie_request.Genre.toLowerCase()} <br>
                    <span class="space"></span>Year: ${movie_request.Year} <br>
                    <span class="space"></span>Director: ${movie_request.Director} <br>
                    <span class="space"></span>Actors: ${movie_request.Actors} <br>
                </span class="plot__info">
                <span class="space"></span>${movie_request.Plot}
            `
            // 
            // 
    
            // Puting every element in the fragment
            movie_info.append(title)
            movie_info.append(plot)
            movie_info_container.append(movie_info)
            info_favourite.append(add_favourite)
            movie_info_container.append(info_favourite)
            if(screen_w >= 700) movie.append(movie_info_container)
            else movie.classList.add('movie-container__movie--response')
            movie.append(movie_poster)
            fragment.append(movie)
    
            // Mouse title on
            newMouseTitle(info_favourite, 'click to add as favourite')
    
            // Element's events
            if(screen_w < 700) movie.addEventListener('click', ()=> showMovieSection(movie_data.imdbID))
            
            info_favourite.addEventListener('click', ()=> {
                    addFavourite(movie_data)
                    check_favourite = false
            })
        }
    }else{
            const movie_request = await getMovie(data.imdbID)
    
            // making elements
            const movie = document.createElement('div')
            const movie_poster = document.createElement('img')
            const movie_info_container = document.createElement('div')
            const movie_info = document.createElement('div')
            const info_favourite = document.createElement('div')
            const add_favourite = document.createElement('i')
            const title = document.createElement('div')
            const plot = document.createElement('p')
    
        
            // Element's class
            movie.classList.add('movie-container__movie')
            movie_poster.classList.add('movie__poster')
            movie_info_container.classList.add('movie__info-container')
            info_favourite.classList.add('info-container__favourite')
            add_favourite.classList.add('far')
            add_favourite.classList.add('fa-bookmark')
            movie_info.classList.add('info-container__info')
            title.classList.add('info-container__title')
            plot.classList.add('info-container__plot')
            
            
            // Poster on
            movie_poster.setAttribute('src', data.Poster)
            
            // Info on
            title.textContent = data.Title
            plot.innerHTML = `
                <span class="plot__info">
                    <span class="space"></span>${movie_request.Rated} <br>
                    <span class="space"></span>${movie_request.Type.toUpperCase()} ${movie_request.Genre.toLowerCase()} <br>
                    <span class="space"></span>Year: ${movie_request.Year} <br>
                    <span class="space"></span>Director: ${movie_request.Director} <br>
                    <span class="space"></span>Actors: ${movie_request.Actors} <br>
                </span class="plot__info">
                <span class="space"></span>${movie_request.Plot}
            `

            add_favourite.setAttribute('id', 'add-favourite')
    
            // Puting every element in the fragment
            movie_info.append(title)
            movie_info.append(plot)
            movie_info_container.append(movie_info)
            info_favourite.append(add_favourite)
            movie_info_container.append(info_favourite)
            if(screen_w >= 700) movie.append(movie_info_container)
            else movie.classList.add('movie-container__movie--response')
            movie.append(movie_poster)
            fragment.append(movie)
    
            // Mouse title on
            newMouseTitle(info_favourite, 'click to add as favourite')
    
            // Element's events
            if(screen_w < 700) movie.addEventListener('click', ()=> showMovieSection(data.imdbID))
            info_favourite.addEventListener('click', ()=> addFavourite(data))   
    }
    // Puting the fragment in the DOM
    movie_container.innerHTML = ''
    movie_container.append(fragment)
}
// Get movie with plot
const getMovie = async(id)=>{
    let movie;
    await axios({
        method: 'GET',
        url: `http://www.omdbapi.com/?i=${id}&plot=full&apikey=9da1401c`
    }).then(res => checkDataMovie(res.data))
        .then(res => movie = res)
    
    if(movie) return movie
}


// Show movie plot
const showMovieSection = async(id)=>{
    const movie = await getMovie(id)
    const movie_section = document.getElementById('movie-section')
    const movie_poster = document.getElementById('movie-poster')
    const movie_title = document.getElementById('movie-title')
    const movie_info = document.getElementById('movie-info')
    const movie_plot = document.getElementById('movie-plot')
    const movie_section_movie = document.getElementById('movie-section_movie')
    const movie_close = document.getElementById('movie-close')
        
    // Close movie plot
    movie_close.addEventListener('click', ()=>{
        movie_poster.parentElement.scrollBy(0, -movie_poster.parentElement.clientHeight)
        movie_section.classList.add('movie-section--off')
    })

    movie_section.addEventListener('click', (e)=>{
        if(e.target != movie_section_movie &&
            e.target != movie_poster &&
            e.target != movie_title &&
            e.target != movie_info &&
            e.target != movie_plot) movie_section.classList.add('movie-section--off')
    })
    
    //Show movie plot
    if(movie){
        movie_poster.setAttribute('src', movie.Poster)
        movie_title.textContent =  movie.Title
        
        const text = `
            ${movie.Rated} <br>
            ${movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)} ${movie.Genre.toLowerCase()} <br>
            Year: ${movie.Year} <br>
            Director: ${movie.Director} <br>
            Actors: ${movie.Actors} <br>
        `

        movie_info.innerHTML = text        
        movie_plot.textContent = movie.Plot
        movie_section.classList.remove('movie-section--off')
    }
}

// Mouse Title
const mouse_title = document.createElement('div')
mouse_title.classList.add('mouse-title')
mouse_title.classList.add('mouse-title--off')

document.body.append(mouse_title)

const newMouseTitle = (element, text = 'click to read more')=>{
    if(screen_w < 700) return null
    element.addEventListener('mouseenter', ()=>{
        if(!mouse_title.classList.contains('mouse-title--off')) mouse_title.classList.add('mouse-title--off')
        if(!mouse_title.classList.contains('mouse-title')) mouse_title.classList.add('mouse-title')
        mouse_title.innerHTML = text
    })

    element.addEventListener('mousemove', (e)=>{
        const mouse_y = e.clientY
        const mouse_x = e.clientX

        if(!mouse_title.classList.contains('mouse-title--off')) mouse_title.classList.add('mouse-title--off')
        if(mouse_title.classList.contains('mouse-title--to-right')) mouse_title.classList.remove('mouse-title--to-right')

        document.documentElement.style.setProperty('--mouse-top', `${mouse_y+30}px`)
        
        mouse_x-(mouse_title.offsetWidth/2) > 0 ?
        document.documentElement.style.setProperty('--mouse-left', `${mouse_x-(mouse_title.offsetWidth/2)}px`) :
        document.documentElement.style.setProperty('--mouse-left', `0px`) 

        if(mouse_x+(mouse_title.offsetWidth/2) > document.body.offsetWidth) mouse_title.classList.add('mouse-title--to-right')
        
        const showMouse = setTimeout(() => {
            mouse_title.classList.remove('mouse-title--off')
        }, 1200);

        element.addEventListener('mouseleave', ()=>{
            mouse_title.classList.remove('mouse-title')
            clearTimeout(showMouse)
        })
    })
}

const addAClass = (element, newclass, ...oldclass)=>{
    if(element.classList.contains(oldclass)) element.classList.replace(oldclass, newclass)
    else if(!element.classList.contains(newclass)) element.classList.add(newclass)
}

const addMoviesToResults = async (title)=>{
    movies_container_res.innerHTML = ''

    const arr_movies = await movieRequest(title)

    if(arr_movies != undefined){
        const fragment = document.createDocumentFragment()
            
        for(const movie of arr_movies){
            const movie_element = document.createElement('DIV')
            movie_element.classList.add('movies-result__res__movie')
            
            const img = document.createElement('IMG')
            img.setAttribute('src', movie.Poster)
            img.classList.add('movies-result__res__movie__img')

            const movie_title = document.createElement('span')
            movie_title.textContent = movie.Title
            movie_title.classList.add('movies-result__res__movie__title')
            
            movie_element.append(img)
            movie_element.append(movie_title)
            fragment.append(movie_element)

            movie_element.addEventListener('click', ()=> {
                searcher.value = 'search'
                searcher.classList.remove('search-container__input--focus')
                if(screen_w < 700) showMovieSection(movie.imdbID)
                else newMovie(movie)
            })
        }
        
        movies_container_res.append(fragment)

        if(!movies_container.firstElementChild.classList.contains('hide')) movies_container.firstElementChild.classList.add('hide')
        if(!movies_container_err.classList.contains('hide')) movies_container_err.classList.add('hide')
        if(movies_container_res.classList.contains('hide')) movies_container_res.classList.remove('hide')
    }else{
         movies_container_err.innerHTML = await `<div class="movies-result__not-found">${title} not found</div>`

        if(movies_container_err.classList.contains('hide')) movies_container_err.classList.remove('hide')
        if(!movies_container_res.classList.contains('hide')) movies_container_res.classList.add('hide')
        if(!movies_container.firstElementChild.classList.contains('hide')) movies_container.firstElementChild.classList.add('hide')
    }
}

// Get Movies event
const movies_container = document.getElementById('movies-result')
const movies_container_res = document.getElementById('res')
const movies_container_err = document.getElementById('err')

let timeout
searcher.addEventListener('keyup', (e)=>{
    if((48 <= e.which  && e.which <= 90) || e.which === 8){
        clearTimeout(timeout)
        
        // Show movies container
        movies_container.classList.add('movies-result--on')
        if(searcher.value.length === 0) movies_container.classList.remove('movies-result--on')
        if(movies_container.firstElementChild.classList.contains('hide')) movies_container.firstElementChild.classList.remove('hide')
        if(!movies_container_err.classList.contains('hide')) movies_container_err.classList.add('hide')
        if(!movies_container_res.classList.contains('hide')) movies_container_res.classList.add('hide')
        
        timeout = setTimeout(() => {
            addMoviesToResults(searcher.value)
        }, 1000);
    }
})

form_searcher.addEventListener('submit', (e)=>{
    e.preventDefault()
    if(searcher.value.length > 0 && searcher.classList.contains('search-container__input--focus')){
        movies_container.classList.remove('movies-result--on')
        setMainMovies(searcher.value)
        searcher.value = 'search'
        searcher.classList.remove('search-container__input--focus')
    } 
})

// Favourites list
const favourites_logo = document.getElementById('favourites')
const movies_favourites = document.getElementById('movies-favourites')
const movies_favourites_err = movies_favourites.firstElementChild
const movies_favourites_res = movies_favourites.children[1]

favourites_logo.parentElement.addEventListener('click', ()=> {
    movies_favourites.classList.contains('header__favourites-container--off') ?
    movies_favourites.classList.remove('header__favourites-container--off') :
    movies_favourites.classList.add('header__favourites-container--off')
})

const addFavourite = (movie_data, add_to_dom = false)=>{
    openDataBase(movie_data)
        
    if(add_to_dom){
        console.log('added')
        const remove = document.createElement('button')
        remove.classList.add('favourites-container__remove')
        remove.innerHTML = '<i class="fas fa-times remove__icon"></i>'

        const movie = document.createElement('DIV')
        movie.classList.add('favourites-container__movie')
        
        const movie_img = document.createElement('IMG')
        movie_img.classList.add('favourites-container__img')
        movie_img.setAttribute('src', movie_data.Poster)

        const title = document.createElement('DIV')
        title.classList.add('favourites-container__title')
        title.textContent = movie_data.Title

        movie.append(remove)
        movie.append(movie_img)
        movie.append(title)
        movies_favourites_res.append(movie)

        movie.addEventListener('click', (e)=> {
            if(e.target != remove.firstElementChild) newMovie(movie_data)
        })
            
        remove.addEventListener('click', ()=> {
            openDataBase(movie_data, 'removeFavourite')
            movies_favourites_res.removeChild(movie)
            if(!movies_favourites_res.hasChildNodes()) {
                movies_favourites_res.classList.add('favourites-container__res-err--off')
                movies_favourites_err.classList.remove('favourites-container__res-err--off')
            }
        })
        if(!movies_favourites_err.classList.contains('favourites-container__res-err--off')) movies_favourites_err.classList.add('favourites-container__res-err--off')
        if(movies_favourites_res.classList.contains('favourites-container__res-err--off')) movies_favourites_res.classList.remove('favourites-container__res-err--off')
    }
}

// Close movies result & favourites list
const add_f = document.getElementById('add-favourite')
window.addEventListener('click', (e)=>{
    if(movies_container.classList.contains('movies-result--on') &&
        e.target != movies_container &&
        e.target != movies_container_res &&
        e.target != movies_container_err &&
        e.target != movies_container.firstElementChild) movies_container.classList.remove('movies-result--on')

    if(!movies_favourites.classList.contains('header__favourites-container--off') &&
        e.target != favourites_logo.parentElement &&
        e.target != movies_favourites &&
        e.target != movies_favourites_res &&
        e.target != movies_favourites_err &&
        !e.target.classList.contains('remove__icon') &&
        !e.target.classList.contains('info-container__favourite')) movies_favourites.classList.add('header__favourites-container--off')

    if(form_searcher.classList.contains('nav__search-container--on') &&
        e.target != form_searcher &&
        e.target != searcher &&
        e.target != searcher_submit &&
        e.target != movies_container &&
        e.target != movies_container_res &&
        e.target != movies_container_err &&
        e.target != movies_container.firstElementChild){
        form_searcher.classList.remove('nav__search-container--on') 
        searcher.classList.remove('search-container__input--on')
        if(searcher_submit.classList.contains('fa-search--on')) searcher_submit.classList.remove('fa-search--on')
    } 
    
    
})

// Scroll's functions
var scroll = 0;
main.addEventListener('scroll', ()=>{
    const scrollTop = main.scrollTop
    scrollTop > scroll ?
    scrollingDown() :
    scrollingUp()

    scroll = scrollTop
})

var header_position = 0;

const scrollingDown = ()=>{
    if(header_position < 16){
        header_position += 4
        document.documentElement.style.setProperty('--header-position', `-${header_position}vh`)
    }

    if(main.scrollHeight - main.scrollTop === main.clientHeight){
        if(header_position != 16){
            const closing = setInterval(() => {
                header_position += 4
                document.documentElement.style.setProperty('--header-position', `-${header_position}vh`)
                if(header_position == 16) clearInterval(closing)
            }, 10);
        }
    }
}

const scrollingUp = ()=>{
    if(header_position > 0){
        header_position -= 4
        document.documentElement.style.setProperty('--header-position', `-${header_position}vh`)
    }

    if(main.scrollTop == 0){
        if(header_position != 0){
            const showing = setInterval(() => {
                header_position -= 4
                document.documentElement.style.setProperty('--header-position', `-${header_position}vh`)
                if(header_position == 0) clearInterval(showing)
            }, 10);
        }
    }
}