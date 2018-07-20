'use strict';
const express     = require( 'express' );
const cors        = require( 'cors' );
const helmet      = require( 'helmet' );
const dotEnv      = require( 'dotenv' ).config( );

const apiRoutes   = require( './routes/api.js' );
const fccTesting  = require( './routes/fcctesting.js' );
const runner      = require( './test-runner' );

const app  = express( );
const PORT = process.env.PORT || 3000;

app.use( '/static', express.static( 'public' ) );
app.use( cors( { origin: '*' } ) ); //For FCC testing purposes only
app.use( express.urlencoded( { extended: true } ) );

app.use( helmet.xssFilter( ) );

// Index page (static HTML).
app.get( '/', ( req,res ) => {
  res.sendFile( process.cwd( ) + '/views/index.html' );
} );

fccTesting( app ); // For FCC testing purposes.

apiRoutes( app );
    
// 404 Not Found Middleware.
app.use( ( req,res,next ) => {
  res.status( 404 )
    .type( 'text' )
    .send( 'Not Found' );
} );

// Start the server and testing suite.
app.listen( PORT, ( ) => {
  console.log( "Listening on port " + PORT );
  if ( process.env.NODE_ENV === 'test' ) {
    console.log( 'Running Tests...' );
    setTimeout( ( ) => {
      try {
        runner.run( );
      } catch( error ) {
        console.log( 'Tests are not valid:' );
        console.log( error );
      }
    }, 3500 );
  }
} );

module.exports = app; // For testing.
