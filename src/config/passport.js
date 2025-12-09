// src/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Usuario from "../models/usuario.js";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
} = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const nombre = profile.displayName;
        const email = profile.emails?.[0]?.value || "";
        const foto = profile.photos?.[0]?.value || "";

        let usuario = await Usuario.findOne({ googleId });

        if (!usuario) {
          usuario = await Usuario.create({
            googleId,
            nombre,
            email,
            foto
          });
        }

        return done(null, usuario);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((usuario, done) => {
  done(null, usuario.id); // id de Mongo
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findById(id);
    done(null, usuario);
  } catch (err) {
    done(err, null);
  }
});
