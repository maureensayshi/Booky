"use strict";

import { app } from "./common.js";

app.init = function () {
    app.firebase();
    app.initUser();
};

app.initUser = function () {
    app.showLoading();
    firebase.auth().getRedirectResult().then(function (result) {
        app.closeLoading();
        if (result.credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            let token = result.credential.accessToken;
            if (token) {
                window.location = "/";
            }
            console.log(token);
            // [START_EXCLUDE]
            // document.getElementById("quickstart-oauthtoken").textContent = token;
        } else {
            // document.getElementById("quickstart-oauthtoken").textContent = "null";
            // [END_EXCLUDE]
        }
        // The signed-in user info.
        let user = result.user;
        console.log(user);

    }).catch(function (error) {
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        // The email of the user's account used.
        let email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        let credential = error.credential;
        // [START_EXCLUDE]
        if (errorCode === "auth/account-exists-with-different-credential") {
            alert("You have already signed up with a different auth provider for that email.");
            // If you are using multiple auth providers on your app you should handle linking
            // the user's accounts here.
        } else {
            console.error(error);
        }
        // [END_EXCLUDE]
    });
    // [END getidptoken]
    // Listening for auth state changes.
    // [END authstatelistener]
    let gButton = app.get("#google");
    gButton.addEventListener("click", function () {
        app.showLoading();
        if (!firebase.auth().currentUser) {
            // [START createprovider]
            let provider = new firebase.auth.GoogleAuthProvider();
            // [END createprovider]
            // [START addscopes]
            provider.addScope("https://www.googleapis.com/auth/plus.login");
            // [END addscopes]
            // [START signin]
            
            firebase.auth().signInWithRedirect(provider);
            
            // [END signin]
        } else {
            // [START signout]
            // firebase.auth().signOut();
            // [END signout]
        }
        // [START_EXCLUDE]
        // gButton.disabled = true;
        // [END_EXCLUDE]  
    });
};


window.addEventListener("DOMContentLoaded", app.init);