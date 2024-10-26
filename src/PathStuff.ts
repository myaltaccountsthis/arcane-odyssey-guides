const paths = {
    armor: "./armor/",
    armorFile: "./armor/info.json",
    treasure: "./treasure/"
};

if (window.location.hostname == "myaltaccountsthis.github.io") {
    paths.armor = "../armor/";
    paths.armorFile = "../armor/info.json";
    paths.treasure = "../treasure/"
}

export default paths;