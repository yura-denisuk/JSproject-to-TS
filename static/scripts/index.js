let rotatedSvg = document.getElementsByClassName('rotated-svg');
let rotated = document.getElementsByClassName('rotated');

rotated[0].addEventListener('click', function () {
    if (!rotated[0].classList.contains('clicked')) {
        rotated[0].classList.add('clicked');
        rotatedSvg[0].style.animation = "rotate-svg-on .2s linear";
        rotatedSvg[0].style.animationFillMode = "forwards";
    } else {
        rotated[0].classList.remove('clicked');
        rotatedSvg[0].style.animation = "rotate-svg-off .2s linear";
        rotatedSvg[0].style.animationFillMode = "forwards";
    }
});

rotated[0].addEventListener('focusout', () => {
    rotated[0].classList.remove('clicked');
    rotatedSvg[0].style.animation = "rotate-svg-off .2s linear";
    rotatedSvg[0].style.animationFillMode = "forwards";
});


