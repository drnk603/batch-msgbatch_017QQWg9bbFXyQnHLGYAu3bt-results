(function () {
  var headers = document.querySelectorAll('.dr-header');
  if (!headers.length) return;

  headers.forEach(function (header) {
    var toggle = header.querySelector('.dr-nav-toggle');
    var nav = header.querySelector('.dr-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('dr-header-nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
})();