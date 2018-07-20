'use strict';

const MongoClient = require( 'mongodb' );
const ObjectId    = require( 'mongodb' ).ObjectID;
const xssFilters  = require( 'xss-filters' );

const DB_URI   = process.env.DB;
const ENDPOINT = '/api/issues/:project';

module.exports = ( app ) => {

  app.get( ENDPOINT, ( req,res ) => {
    const project = req.params.project;
    const query   = req.query;
    if ( query._id )   query._id  = new ObjectId( query._id );
    if ( query.open === '' || query.open === 'true' )  query.open = true;
    else if ( query.open === 'false' )                 query.open = false;

    MongoClient.connect( DB_URI )
      .then( db => {
        const collection = db.collection( project );
        collection.find( query ).sort( { updated_on: -1 } ).toArray( ( error,doc ) => {
          if ( !error ) res.json( doc );
          else          res.send( error );
        } );

      } )
      .catch( error => {
        res.send( error ) 
      } );
  } )

  app.post( ENDPOINT, ( req,res ) => {
    const newIssue = {
      issue_title   : req.body.issue_title,
      issue_text    : req.body.issue_text,
      assigned_to   : req.body.assigned_to || '',
      status_text   : req.body.status_text || '',
      created_by    : req.body.created_by,
      open          : true
    };
    const project = xssFilters.inHTMLData( req.params.project );

    // Sanitize input data.
    for ( let input in newIssue ) {
      if ( input !== 'open' ) {
        newIssue[ input ] = xssFilters.inHTMLData( newIssue[ input ] );
        if ( newIssue[ input ] === 'undefined' ) newIssue[ input ] = undefined;
      }
    }
    newIssue.created_on = Date.now( );
    newIssue.updated_on = Date.now( );

    if ( newIssue.issue_title && newIssue.issue_text && newIssue.created_by ) {
      MongoClient.connect( DB_URI )
        .then( db => {
          const collection = db.collection( project );
          collection.insertOne( newIssue )
            .then( doc => {
              newIssue._id = doc.insertedId;
              res.json( newIssue );
            } )
            .catch( error => res.send( error ) );
        } )
        .catch( error => res.send( error ) );
    } else {
      res.send( 'Sorry, but "issue_title", "issue_text" and "created_by" are all required' );
    }
  } );

  app.put( ENDPOINT, ( req,res ) => {
    const project     = xssFilters.inHTMLData( req.params.project );
    const inputs      = req.body;
    const issueID     = xssFilters.inHTMLData( inputs._id );

    delete inputs._id;            // Delete from object to check if all other inputs are empty.
    for ( let input in inputs ) { // Delete all empty properties and sanitize.
      if ( !inputs[ input ] && input !== 'open' )
        delete inputs[ input ];
      else
        inputs[ input ] = xssFilters.inHTMLData( inputs[ input ] );
    }

    if ( Object.keys( inputs ).length > 0 ) {
      // Assigned here just to meet the user stories.
      // If assigned before, an empty form could be sent.
      inputs.open       = !inputs.open;
      inputs.updated_on = Date.now( );

      MongoClient.connect( DB_URI ) // Connect to DB and update document.
        .then( db => {
          const collection = db.collection( project );
          collection.findAndModify(
            { _id: new ObjectId( issueID ) },
            [ [ '_id',1 ] ],
            { $set: inputs },
            { new: true } )  // Returns the updated collection.
              .then( doc => res.send( 'successfully updated' ) )
              .catch( error => res.send( error ) )
        } )
        .catch( error => res.send( error ) );
    } else {
      res.send( 'no updated field sent' );
    }
  } );
    
  app.delete( ENDPOINT, ( req,res ) => {
    const project = req.params.project;
    const issueID = req.body._id;

    if ( issueID ) {
      MongoClient.connect( DB_URI )
        .then( db => {
          const collection = db.collection( project );
          collection.findOneAndDelete( { _id: new ObjectId( issueID ) } )
            .then( doc => res.send( `deleted ${issueID}` ) )
            .catch( error => res.send ( `could not delete ${issueID}` ) )
        } )
    } else {
      res.send( '_id error' );
    }
  } );

};
