document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('movieForm').addEventListener('submit', function(event) {
        event.preventDefault();

        var movieTitle = document.getElementById('movieTitle').value.trim();
        var movieLink = document.getElementById('movieLink').value.trim();
        var backdropOption = document.querySelector('input[name="backdropOption"]:checked');
        var apiKey = document.getElementById('apiKey').value.trim();
        var customBackdropLink = document.getElementById('customBackdropLink').value.trim();
        var selectedBackdrop = document.querySelector('.banner-results img.selected');
        var backdropURL = '';

        if (!movieTitle || !movieLink) {
            alert('Please enter both the movie name and movie link.');
            return;
        }

        if (backdropOption.value === 'search') {
            if (!apiKey || !selectedBackdrop) {
                alert('Please enter your TMDB API Key and select a backdrop image.');
                return;
            }
            backdropURL = 'https://image.tmdb.org/t/p/original' + selectedBackdrop.getAttribute('data-image-path');
        } else if (backdropOption.value === 'custom') {
            if (!customBackdropLink) {
                alert('Please enter a custom backdrop URL.');
                return;
            }
            backdropURL = customBackdropLink;
        }

        var encodedMovieLink = encodeURIComponent(movieLink);
        var generatedURL = `https://discord.nfp.is/?v=${encodedMovieLink}&background=${encodeURIComponent(backdropURL)}`;
        displayGeneratedURL(generatedURL);
    });

    document.querySelectorAll('.radio-container input[type="radio"]').forEach(option => {
        option.addEventListener('change', function() {
            var apiKeyContainer = document.getElementById('apiKeyContainer');
            var backdropSearchContainer = document.getElementById('backdropSearchContainer');
            var customBackdropContainer = document.getElementById('customBackdropContainer');

            if (this.value === 'search') {
                apiKeyContainer.style.display = 'block';
                backdropSearchContainer.style.display = 'block';
                customBackdropContainer.style.display = 'none';
            } else if (this.value === 'custom') {
                apiKeyContainer.style.display = 'none';
                backdropSearchContainer.style.display = 'none';
                customBackdropContainer.style.display = 'block';
            }
        });
    });

    function displayGeneratedURL(url) {
        var resultDiv = document.getElementById('result');
        resultDiv.style.display = 'block';
        resultDiv.textContent = url;
    }

    document.getElementById('backdropSearch').addEventListener('input', function() {
        var apiKey = document.getElementById('apiKey').value.trim();
        var searchQuery = this.value.trim();

        if (!apiKey || !searchQuery) return;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.themoviedb.org/3/search/movie?api_key=' + apiKey + '&query=' + encodeURIComponent(searchQuery));
        xhr.onload = function() {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.results && data.results.length > 0) {
                    var movieId = data.results[0].id;
                    var xhrBackdrop = new XMLHttpRequest();
                    xhrBackdrop.open('GET', 'https://api.themoviedb.org/3/movie/' + movieId + '/images?api_key=' + apiKey);
                    xhrBackdrop.onload = function() {
                        if (xhrBackdrop.status === 200) {
                            var backdropData = JSON.parse(xhrBackdrop.responseText);
                            var backdropResults = backdropData.backdrops;
                            var backdropResultsContainer = document.getElementById('backdropResults');
                            backdropResultsContainer.innerHTML = '';

                            if (backdropResults && backdropResults.length > 0) {
                                backdropResults.slice(0, 5).forEach(function(image) {
                                    var imgElement = document.createElement('img');
                                    imgElement.src = 'https://image.tmdb.org/t/p/w500/' + image.file_path;
                                    imgElement.setAttribute('data-image-path', image.file_path);
                                    imgElement.addEventListener('click', function() {
                                        var selectedImages = document.querySelectorAll('.banner-results img.selected');
                                        selectedImages.forEach(function(selectedImg) {
                                            selectedImg.classList.remove('selected');
                                        });
                                        imgElement.classList.add('selected');
                                    });
                                    backdropResultsContainer.appendChild(imgElement);
                                });
                            } else {
                                backdropResultsContainer.textContent = 'No backdrops found for the selected movie.';
                            }
                        }
                    };
                    xhrBackdrop.send();
                }
            }
        };
        xhr.send();
    });

    document.getElementById('result').addEventListener('click', function() {
        if (this.textContent) {
            var textarea = document.createElement('textarea');
            textarea.value = this.textContent;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Result copied to clipboard!');
        }
    });
});
