'use-strict';

var apiKey = '5288bfcb2ff12f6dbc54c6fd2a7e0a8a';
var apiKeyExtra = 'c7d2ce33824ed8870a4bb6236255cf87';
var locationApiKey ='AIzaSyAoab3NjCP-nDXhnAOeY0VepNgoXNWcN0s';

// search form
var searchForm = document.getElementById('search-form');

// elements without data
var userLocation = document.getElementById('search-location');
var insurance = document.getElementById('search-insurance');
var specialty = document.getElementById('search-specialty');
var gender = document.getElementById('search-gender');
var results = document.getElementById('search-results');

// elements displaying results
var allResults = document.getElementById('results');
var searchError = document.getElementById('search-error');

function saveDoctor(doctorFName, doctorLName, doctorPhone, doctorAddress, doctorSpecialty, doctorPractice){
    var user = firebase.auth().currentUser;
    if (user) {
        var doctors = database.ref('savedDoctors/' + user.uid);
        
        doctors.push({
            firstName: doctorFName,
            lastName: doctorLName, 
            phone: doctorPhone,
            address: doctorAddress,
            specialty: doctorSpecialty,
            practice: doctorPractice
        })
            .then(function(){
                // if success we're good
            })
            .catch(function (error){
                alert(error.message);
            })
    } else {
        window.location = "login.html";
    }
}

searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    results.innerHTML = "";
    allResults.classList.remove('active');

    var chosenLocation = userLocation.value;
    var userInsurance = insurance.value;
    var doctorSpecialty = specialty.value;
    var doctorGender = gender.value;

    // gets location from city name using geolocation api
    var locationUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + chosenLocation + '&key=' + locationApiKey;
    fetch(locationUrl)
        .then(
            function(response) {
                return response.json()
                .then(function(json) {
                    var locationData = json.results[0].geometry;
                    var lat = locationData.location.lat;
                    var long = locationData.location.lng;
                    var latLong  = lat + ',' + long + ',100';
                    return latLong;
                }).catch(function(error) {
                    //when user types wrong location
                    searchError.classList.add('active');
                    searchError.innerHTML = "Location not found. Please try a different location";
                })
                .then(
                    function(latLong) {
                        // request for doctor data using long lat data
                        var url = 'https://api.betterdoctor.com/2016-03-01/doctors?location=' + latLong + '&skip=0&user_key=' + apiKey;

                        if(doctorGender !== 'No Preference') {
                            doctorGender = doctorGender.toLowerCase();
                            url += '&gender=' + doctorGender;
                        } 
                        if (userInsurance !== 'None') {
                            url += '&insurance_uid=' + userInsurance;
                        } 
                        if(doctorSpecialty !== 'None') {
                            url += '&specialty_uid=' + doctorSpecialty;
                        }
                        // function that calls betterdoctor api
                        fetchDoctor(url);
                    }
                )
            });
        });

function fetchDoctor(url) {
    fetch(url)
    .then(function(response) {
        return response.json()
        // get data that user will see (list of doctors)
        .then(function(json) {
            // json is array of each doctor
            var data = json.data;
            if(data.length === 0) {
                searchError.classList.add('active');
                searchError.innerHTML = 'No matching doctors found.';
            } else {
                allResults.classList.add('active');
                searchError.classList.remove('active');
                for(var i = 0; i < data.length; i++){
                    var v = json.data[i];
                    var practices = v.practices;

                    // saves first practice within search area
                    var prac;
                    for(var k = 0; k < practices.length; k++) {
                        if(practices[k].within_search_area) {
                            prac = practices[k];
                            break;
                        }
                    }
                    if(prac !== undefined) {
                        // doctor profile info
                        var profile = v.profile;
                    
                        var fName = profile.first_name;
                        var lName = profile.last_name;
        
                        var bio = profile.bio;
        
                        var gender = profile.gender;

                        // example: MD 
                        var title = profile.title;

                        // doctor specialty 
                        var specTitle;
                        if(v.specialties.length !== 0) {
                            specTitle = v.specialties[0].actor;
                        } else {
                            specTitle = "None";
                        }

                        // Name of practice
                        var pracName = prac.name;

                        // Address info
                        var pracAddress = prac.visit_address;                                        
                        var pracStreet = pracAddress.street;
                        var pracCity = pracAddress.city;
                        var pracState = pracAddress.state;

                        // practice phone number
                        var phoneNum = prac.phones[0].number;

                        // adding doctor into the results on webpage
                        var doctor = document.createElement('li');
                        doctor.classList.add('details');
    
                        var docName = document.createElement('p');
                        docName.innerHTML = "Name: " + fName + " " + lName + " (" + gender + ")";
    
                        var docTitle = document.createElement('p');
                        docTitle.innerHTML = "Title: " + title;
    
                        var docSpecialty = document.createElement('p');
                        docSpecialty.innerHTML = "Specialty: " + specTitle;
    
                        var docPractice = document.createElement('p');
                        docPractice.innerHTML = "Practice Name: " + pracName;
    
                        var docPracticeAddress = document.createElement('p');
                        docPracticeAddress.innerHTML = "Address: " + pracStreet + ", " + pracCity + ", " + pracState;
        
                        var docPhone = document.createElement('p');
                        docPhone.innerHTML = "Phone: " + phoneNum;
        
                        var docDescription = document.createElement('p');
                        docDescription.id = "doctor-bio";
                        docDescription.innerHTML = bio;
        
                        var docSave = document.createElement('button');
                        docSave.type = "submit";
                        docSave.className = "btn btn-primary save-doctor";
                        docSave.innerHTML = 'Save';
                        var address = pracStreet + ", " + pracCity + ", " + pracState;
                        docSave.setAttribute("onclick", "saveDoctor('" + fName + "','" + lName + "','" + phoneNum + "','" + address + "','" + specTitle + "','" + pracName + "')");
    
                        results.appendChild(doctor);
                        doctor.appendChild(docName);
                        doctor.appendChild(docTitle);
                        doctor.appendChild(docSpecialty);
                        doctor.appendChild(docPractice);
                        doctor.appendChild(docPracticeAddress);
                        doctor.appendChild(docPhone);
                        doctor.appendChild(document.createElement('br'));
                        doctor.appendChild(docDescription);
                        doctor.appendChild(docSave);
                        doctor.appendChild(document.createElement('hr'));
                    } else {
                        // doctor has no practices within the search area
                    }
                }
            }
        })
    })
    .catch(function(error) {
        allResults.classList.remove('active');
        searchError.classList.add('active');
        searchError.innerHTML = 'Try a different city.';
        // error message
    })
}

window.addEventListener('DOMContentLoaded', function(e) {
    // two API keys --> only way to run to API requests at same time
    var insurUrl = 'https://api.betterdoctor.com/2016-03-01/insurances?user_key=' + apiKey;

    var specUrl = 'https://api.betterdoctor.com/2016-03-01/specialties?user_key=' + apiKeyExtra;

    fetch(specUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        var specArray = json.data;
        for(var i = 0; i < specArray.length; i++) {
            var v = specArray[i];
            var specName = v.name;
            var specUid = v.uid;
            var option = document.createElement('option');
            var val = document.createAttribute('value');
            val.value = specUid;
            option.setAttributeNode(val);
            option.innerHTML = specName;

            specialty.appendChild(option);
        }
    })

    fetch(insurUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        var insuranceArray = json.data;
        for(var i = 0; i < insuranceArray.length; i++) {
            var v = insuranceArray[i];
            var plans = v.plans;
            for(var k = 0; k < plans.length; k++) {
                var uid = plans[k].uid;
                var name = plans[k].name;
                var option = document.createElement('option');
                var val = document.createAttribute('value');
                val.value = uid;

                option.setAttributeNode(val);
                option.innerHTML = name;

                insurance.appendChild(option);
            }
        }
    })
})

// FIREBASE SAVED DOCTOR MANAGEMENT
var logoutButton = document.getElementById('logout-button');
var loginButton = document.getElementById('login-button');
var savedDoctors = document.getElementById('saved-doctor-list');

var auth = firebase.auth();
var database = firebase.database();

logoutButton.addEventListener('click', function (e) {
    auth.signOut();
    savedDoctors.innerHTML = "";
});

auth.onAuthStateChanged(function (user) {
    // If the user is logged in, user will be an object (truthy).
    // Otherwise, it will be null (falsey).
    if (user) {
		loginButton.classList.add('hidden');
        logoutButton.classList.remove('hidden');
		// Logged in
        var doctors = database.ref('savedDoctors/' + user.uid);

        doctors.on('child_added', function(data){
            var id = data.key;
            var doctor = data.val();

            var docElement = document.createElement('li');
            docElement.classList.add('details');
            docElement.classList.add('saved')
            docElement.id = id;

            var docName = document.createElement('p');
            docName.innerHTML = "Name: " + doctor.firstName + " " + doctor.lastName;

            var docSpecialty = document.createElement('p');
            docSpecialty.innerHTML = "Specialty: " + doctor.specialty;

            var docPractice = document.createElement('p');
            docPractice.innerHTML = "Practice Name: " + doctor.practice;

            var docPracticeAddress = document.createElement('p');
            docPracticeAddress.innerHTML = "Address: " + doctor.address;

            var docPhone = document.createElement('a');
            docPhone.classList.add("phone")
            docPhone.href = "tel:" + doctor.phone;

            var inDocPhone = document.createElement('p');
            inDocPhone.innerHTML = "Phone: " + doctor.phone;
            docPhone.appendChild(inDocPhone);

            var deleteDoc = document.createElement('i');
            deleteDoc.classList.add('del');
            deleteDoc.classList.add('fa');
            deleteDoc.classList.add('fa-trash');
            deleteDoc.addEventListener('click', function(){
                if (confirm("Delete saved doctor?")) {
                    var user = firebase.auth().currentUser;
                    var deleteMessage = database.ref('savedDoctors/' + user.uid + '/' + id);
                    deleteMessage.remove();
                }
            });

            docElement.appendChild(docName);
            docElement.appendChild(docSpecialty);
            docElement.appendChild(docPractice);
            docElement.appendChild(docPracticeAddress);
            docElement.appendChild(docPhone);
            docElement.appendChild(deleteDoc);
            savedDoctors.appendChild(docElement);
        });

        doctors.on('child_removed', function (data) {
            var id = data.key;
            var doctor = document.getElementById(id);
            savedDoctors.removeChild(doctor);
        });

    } else {
        // Logged out
        logoutButton.classList.add('hidden');
		loginButton.classList.remove('hidden');
    }
});



