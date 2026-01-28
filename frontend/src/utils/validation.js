// src/utils/validation.js
export const WIKI_URL_REGEX = /^https?:\/\/(?:[a-z]{2,3}\.)?wikipedia\.org\/wiki\/[\w\-()%]+$/;

export const isValidWikiUrl = (url) => WIKI_URL_REGEX.test(url);