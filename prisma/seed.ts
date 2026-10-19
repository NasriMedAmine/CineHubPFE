// Script qui remplit le catalogue avec quelques films de démonstration.
// Lancement : npx prisma db seed
// Les affiches sont des illustrations originales (SVG) stockées dans public/images/posters.
// Aucun avis n'est créé ici : les notes viennent uniquement des vrais utilisateurs.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const movies = [
  {
    title: "Inception",
    poster: "/images/posters/inception.svg",
    description:
      "Dom Cobb est un voleur capable de s'introduire dans les rêves des autres pour y dérober des secrets. On lui propose une mission inverse : implanter une idée dans l'esprit d'un héritier.",
    genre: "Science-fiction",
    releaseYear: 2010,
    director: "Christopher Nolan",
    duration: 148,
  },
  {
    title: "Interstellar",
    poster: "/images/posters/interstellar.svg",
    description:
      "Alors que la Terre devient inhabitable, un ancien pilote part avec une équipe d'explorateurs à travers un trou de ver pour trouver une nouvelle planète pour l'humanité.",
    genre: "Science-fiction",
    releaseYear: 2014,
    director: "Christopher Nolan",
    duration: 169,
  },
  {
    title: "Matrix",
    poster: "/images/posters/matrix.svg",
    description:
      "Le pirate informatique Neo découvre que le monde qu'il connaît est une simulation contrôlée par des machines, et rejoint un groupe de rebelles pour se libérer.",
    genre: "Science-fiction",
    releaseYear: 1999,
    director: "Lana et Lilly Wachowski",
    duration: 136,
  },
  {
    title: "Mad Max: Fury Road",
    poster: "/images/posters/mad-max-fury-road.svg",
    description:
      "Dans un désert post-apocalyptique, Max et l'Impératrice Furiosa fuient un tyran à bord d'un camion blindé, poursuivis par une armée de véhicules.",
    genre: "Action",
    releaseYear: 2015,
    director: "George Miller",
    duration: 120,
  },
  {
    title: "John Wick",
    poster: "/images/posters/john-wick.svg",
    description:
      "Un ancien tueur à gages sort de sa retraite pour se venger des gangsters qui lui ont tout pris.",
    genre: "Action",
    releaseYear: 2014,
    director: "Chad Stahelski",
    duration: 101,
  },
  {
    title: "The Dark Knight",
    poster: "/images/posters/the-dark-knight.svg",
    description:
      "Batman, aidé du lieutenant Gordon et du procureur Harvey Dent, affronte le Joker, un criminel imprévisible qui veut plonger Gotham dans le chaos.",
    genre: "Action",
    releaseYear: 2008,
    director: "Christopher Nolan",
    duration: 152,
  },
  {
    title: "Top Gun: Maverick",
    poster: "/images/posters/top-gun-maverick.svg",
    description:
      "Plus de trente ans après ses débuts, le pilote Pete « Maverick » Mitchell doit former un groupe de jeunes pilotes pour une mission très dangereuse.",
    genre: "Action",
    releaseYear: 2022,
    director: "Joseph Kosinski",
    duration: 130,
  },
  {
    title: "Parasite",
    poster: "/images/posters/parasite.svg",
    description:
      "Une famille pauvre de Séoul s'infiltre petit à petit au service d'une famille riche, jusqu'à ce qu'un secret fasse basculer la situation.",
    genre: "Thriller",
    releaseYear: 2019,
    director: "Bong Joon-ho",
    duration: 132,
  },
  {
    title: "Le Fabuleux Destin d'Amélie Poulain",
    poster: "/images/posters/amelie.svg",
    description:
      "À Montmartre, une jeune serveuse discrète décide d'améliorer en secret la vie des personnes qui l'entourent.",
    genre: "Comédie",
    releaseYear: 2001,
    director: "Jean-Pierre Jeunet",
    duration: 122,
  },
  {
    title: "Intouchables",
    poster: "/images/posters/intouchables.svg",
    description:
      "Un riche aristocrate tétraplégique engage comme aide à domicile un jeune homme de banlieue. Une amitié inattendue naît entre eux.",
    genre: "Comédie",
    releaseYear: 2011,
    director: "Olivier Nakache et Éric Toledano",
    duration: 112,
  },
  {
    title: "The Grand Budapest Hotel",
    poster: "/images/posters/grand-budapest-hotel.svg",
    description:
      "Le concierge d'un grand hôtel européen et son jeune groom se retrouvent mêlés au vol d'un tableau et à une affaire d'héritage.",
    genre: "Comédie",
    releaseYear: 2014,
    director: "Wes Anderson",
    duration: 99,
  },
  {
    title: "Le Voyage de Chihiro",
    poster: "/images/posters/chihiro.svg",
    description:
      "Une fillette se retrouve dans un monde peuplé d'esprits et doit travailler dans un établissement de bains pour sauver ses parents.",
    genre: "Animation",
    releaseYear: 2001,
    director: "Hayao Miyazaki",
    duration: 125,
  },
  {
    title: "Coco",
    poster: "/images/posters/coco.svg",
    description:
      "Miguel, un jeune garçon passionné de musique, se retrouve au pays des morts pendant la fête des morts mexicaine et découvre l'histoire de sa famille.",
    genre: "Animation",
    releaseYear: 2017,
    director: "Lee Unkrich",
    duration: 105,
  },
  {
    title: "Get Out",
    poster: "/images/posters/get-out.svg",
    description:
      "Un jeune photographe rend visite à la famille de sa petite amie pour un week-end. L'accueil chaleureux cache quelque chose d'inquiétant.",
    genre: "Horreur",
    releaseYear: 2017,
    director: "Jordan Peele",
    duration: 104,
  },
  {
    title: "Whiplash",
    poster: "/images/posters/whiplash.svg",
    description:
      "Un jeune batteur de jazz entre dans un conservatoire réputé et se heurte à un professeur extrêmement exigeant.",
    genre: "Drame",
    releaseYear: 2014,
    director: "Damien Chazelle",
    duration: 106,
  },
];

async function main() {
  // On n'ajoute les films que si le catalogue est vide,
  // pour pouvoir relancer le script sans créer de doublons.
  const movieCount = await prisma.movie.count();

  if (movieCount > 0) {
    console.log(`Le catalogue contient déjà ${movieCount} films, rien à faire.`);
    return;
  }

  for (const movie of movies) {
    await prisma.movie.create({ data: movie });
  }

  console.log(`${movies.length} films ajoutés au catalogue.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
