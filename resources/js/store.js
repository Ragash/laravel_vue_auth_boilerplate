import Vue from 'vue' 
import Vuex from 'vuex'
import VueCookie from 'vue-cookie'

// to make API calls
import { router } from './router'
import axios from 'axios'

Vue.use(Vuex)
Vue.use(VueCookie)

export default new Vuex.Store({

    state() {
        let userToken = Vue.cookie.get('token');
        let user = Vue.cookie.get('user');

        let currentUser = JSON.stringify(user);

        console.log("[STORE.STATE] --> user: " + (currentUser));
        console.log("[STORE.STATE] --> token: " + (userToken));

        return {
            token: userToken ? userToken : null,
            user: user ? user : null,
            dogs: [],
        }
    },
    getters: { 
        // getters get data from state, feed components
        // if there is a token, the user is authenticated
        isAuthenticated: state => !!state.token,
        currentUser: state => state.user,
    },
    mutations: {
        setLoginCred(state, payload) {
            state.token = payload.token;
            state.user = payload.user;
            state.isAuthenticated = true;
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + payload.token
        },
        setUser(state, user) {
            state.user = user;
        },
        getAllDogs(state) {
            axios.call("get", "/api/dogs").then(({ data }) => {
                console.log("[API call to dogs]: " + data);

                state.dogs.push(data.data);
            })
            .catch(error => {
                console.log("API call error: " + error);
            });
        },
        logout(state) {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            Vue.cookie.delete('token');
            Vue.cookie.delete('user');
        },
    },
    actions: {
        setLoginCred(context, payload) {
            context.commit('setLoginCred', payload)
        },
        refreshUserData(context) {
            axios.call("get", "/api/user").then((userData) => {
                let user = userData.data.data
                console.log("USER ----> " + user);
                context.commit('setUser', user)
            })
        },
        getAllDogs(context) {
            context.commit('getAllDogs')
        },
        getDogs({ commit }) {
            // commit('showLoader')
            // api.call("get", "/api/users/current").then((userData) => {
            //     let user = userData.data.data
            //     window.localStorage.setItem('user', JSON.stringify(user))
            //     commit('setUser', user)
            //     commit('hideLoader')
            // })
        },
        logout( { commit }) {
        
            axios.post("/api/logout").then((userData) => {        
                
                commit('logout');

                router.push({ path: '/' });
            })
        },
    }

})