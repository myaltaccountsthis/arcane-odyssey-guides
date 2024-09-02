const paths = {
    armor: "./armor/",
    treasure: "./treasure/"
};

if (window.location.hostname == "myaltaccountsthis.github.io") {
    paths.armor = "../armor/";
    paths.treasure = "../treasure/"
}

export default paths;