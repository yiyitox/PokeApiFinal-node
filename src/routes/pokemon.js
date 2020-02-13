const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
const poll = require('../database');
const axios = require("axios");

const mysqlConnection = require('../database')


// Rutas Pokemon
router.get('/Lista', isLoggedIn, (req, res) => {
    res.render('Pokemon/Lista');
});

router.get('/Pokedex', isLoggedIn, (req, res) => {
    res.render('Pokemon/Pokedex');
});

router.get('/Batalla', isLoggedIn, (req, res) => {
    res.render('Pokemon/Batalla');
});

//RUTAS

router.get("/", async(req, res) => {
    res.status(200).send('aaaaa');
})

const getPokemon = async id => {
    const response = await axios.get("https://pokeapi.co/api/v2/pokemon/" + id);
    const { data } = response;
    return {
        abilities: data.abilities,
        name: data.name,
        types: data.types,
        img: data.sprites.front_shiny,
        id
    };
};

router.post("/:id", async(req, res) => {
    const { id } = req.params
    const pokemon = await getPokemon(id)
    const types = pokemon.types.map(x => x.type.name).join(", ")
    const abilities = pokemon.abilities.map(x => x.ability.name).join(", ")
    await mysqlConnection.query("INSERT INTO pokemon (id, name, img, types, abilities) VALUES (?, ?, ?, ?, ?)", [id, pokemon.name, pokemon.img, types, abilities])
    const savedPokemon = {
        ...pokemon,
        id: Number(id),
        types,
        abilities,
        saved: true
    }
    res.json({ status: true, pokemon: savedPokemon });
});

router.delete("/:id", async(req, res) => {
    const { id } = req.params
    await mysqlConnection.query("DELETE FROM pokemon WHERE id = ?", [id])
    res.json({ status: true });
})


// router.get("/:id", async(req, res) => {
//     const { id } = req.params
//     await mysqlConnection.query("SELECT * FROM pokemon", [id])
//     res.json({ status: true })
// })



module.exports = router;