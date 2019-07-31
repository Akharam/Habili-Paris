-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Hôte : eu-cdbr-west-02.cleardb.net:3306
-- Généré le :  ven. 14 juin 2019 à 07:23
-- Version du serveur :  5.6.43-log
-- Version de PHP :  5.6.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `heroku_98ee4c509596e21`
--

-- --------------------------------------------------------

--
-- Structure de la table `certifications`
--

DROP TABLE IF EXISTS `certifications`;
CREATE TABLE IF NOT EXISTS `certifications` (
  `ID_certif` int(11) NOT NULL AUTO_INCREMENT,
  `Nom_certif` varchar(255) NOT NULL,
  `Duree_valide` int(11) NOT NULL,
  `Description_certif` varchar(400) DEFAULT NULL,
  `id_entreprise` int(11) NOT NULL,
  `Periode_souplesse` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID_certif`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8;


-- --------------------------------------------------------

--
-- Structure de la table `contrats`
--

DROP TABLE IF EXISTS `contrats`;
CREATE TABLE IF NOT EXISTS `contrats` (
  `ID_contrat` int(11) NOT NULL AUTO_INCREMENT,
  `Nom_contrat` varchar(255) NOT NULL,
  `id_entreprise` int(11) NOT NULL,
  PRIMARY KEY (`ID_contrat`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `contrats`
--


-- --------------------------------------------------------

--
-- Structure de la table `employe`
--

DROP TABLE IF EXISTS `employe`;
CREATE TABLE IF NOT EXISTS `employe` (
  `ID_emp` int(11) NOT NULL AUTO_INCREMENT,
  `Nom_emp` varchar(255) NOT NULL,
  `Prenom_emp` varchar(255) NOT NULL,
  `Contrat` int(11) NOT NULL,
  `Date_embauche` date NOT NULL,
  `Poste` varchar(255) NOT NULL,
  `Token_qr` varchar(50) NOT NULL,
  `Visite_med` date NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `id_entreprise` int(11) NOT NULL,
  `Piece_identite` varchar(255) DEFAULT NULL,
  `Permis_conduire` varchar(255) DEFAULT NULL,
  `Photo_emp` varchar(255) DEFAULT NULL,
  `Certificat_medical` varchar(255) DEFAULT NULL,
  `Duree_visite_medicale` int(11) DEFAULT NULL,
  `Comment_visite_med` text,
  `Passeport` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID_emp`)
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8;


-- --------------------------------------------------------

--
-- Structure de la table `entreprise`
--

DROP TABLE IF EXISTS `entreprise`;
CREATE TABLE IF NOT EXISTS `entreprise` (
  `ID_entreprise` int(11) NOT NULL AUTO_INCREMENT,
  `Nom_entreprise` varchar(255) NOT NULL,
  `Lien_web` varchar(255) NOT NULL,
  `Adresse` varchar(255) DEFAULT NULL,
  `Ville` varchar(255) NOT NULL,
  PRIMARY KEY (`ID_entreprise`)
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8;

---------------------------------------------------

--
-- Structure de la table `liaison_emp_cert`
--

DROP TABLE IF EXISTS `liaison_emp_cert`;
CREATE TABLE IF NOT EXISTS `liaison_emp_cert` (
  `ID_liaison` int(11) NOT NULL AUTO_INCREMENT,
  `id_certif` int(11) NOT NULL,
  `id_emp` int(11) NOT NULL,
  `Date_passage` date NOT NULL,
  `Date_fin` date NOT NULL,
  `Fichier_certif` varchar(255) NOT NULL,
  PRIMARY KEY (`ID_liaison`)
) ENGINE=InnoDB AUTO_INCREMENT=321 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `postes`
--

DROP TABLE IF EXISTS `postes`;
CREATE TABLE IF NOT EXISTS `postes` (
  `ID_poste` int(11) NOT NULL AUTO_INCREMENT,
  `Nom_poste` varchar(255) NOT NULL,
  `id_service` int(11) NOT NULL,
  `id_entreprise` int(11) NOT NULL,
  PRIMARY KEY (`ID_poste`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8;


-- --------------------------------------------------------

--
-- Structure de la table `services`
--

DROP TABLE IF EXISTS `services`;
CREATE TABLE IF NOT EXISTS `services` (
  `ID_service` int(11) NOT NULL AUTO_INCREMENT,
  `Nom_service` varchar(255) NOT NULL,
  `id_entreprise` int(11) NOT NULL,
  PRIMARY KEY (`ID_service`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
CREATE TABLE IF NOT EXISTS `tokens` (
  `Token_co` varchar(50) NOT NULL,
  `id_emp` int(11) NOT NULL,
  `Date_co` datetime NOT NULL,
  PRIMARY KEY (`Token_co`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `ID_util` int(11) NOT NULL AUTO_INCREMENT,
  `Mail` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Admin` int(11) NOT NULL,
  `id_entreprise` int(11) NOT NULL,
  `Nom_utilisateur` varchar(255) DEFAULT NULL,
  `Prenom_utilisateur` varchar(255) DEFAULT NULL,
  `Poste_utilisateur` varchar(255) DEFAULT NULL,
  `Autorisation` tinyint(1) DEFAULT NULL,
  `Modifier` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`ID_util`)
) ENGINE=InnoDB AUTO_INCREMENT=391 DEFAULT CHARSET=utf8;



/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
