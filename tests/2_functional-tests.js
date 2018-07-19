const chaiHttp  = require( 'chai-http' );
const chai      = require( 'chai' );
const expect    = chai.expect;

const server    = require( '../server' );

chai.use( chaiHttp );

suite( 'Functional Tests', ( ) => {

    let firstInsertedID; // Used to store the first inserted ID and use it later in the PUT tests.
  
    suite( 'POST /api/issues/{project} => object with issue data', ( ) => {
      
      test( 'Every field filled in', ( done ) => {
        chai.request( server )
          .post( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .send( {
            issue_title : 'Every field filled in',
            issue_text  : 'Text',
            created_by  : 'Created by',
            assigned_to : 'Assigned to',
            status_text : 'Filter me'
          } )
          .end( ( err,res ) => {
            expect( res.status ).to.equal( 200 );
            expect( res.body   ).to.have.property( '_id'         );
            expect( res.body   ).to.have.property( 'issue_title' ).to.equal( 'Every field filled in' );
            expect( res.body   ).to.have.property( 'issue_text'  ).to.equal( 'Text' );
            expect( res.body   ).to.have.property( 'created_by'  ).to.equal( 'Created by' );
            expect( res.body   ).to.have.property( 'assigned_to' ).to.equal( 'Assigned to' );
            expect( res.body   ).to.have.property( 'status_text' ).to.equal( 'Filter me' );
            expect( res.body   ).to.have.property( 'open'        ).to.be.a( 'boolean' ).and.to.equal( true );
            // ID to be used later in the PUT tests.
            firstInsertedID = res.body._id;
            done( );
          } );
      } );

      test( 'Required fields filled in', ( done ) => {
        chai.request( server )
          .post( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .send( {
            issue_title : 'Required fields filled in',
            issue_text  : 'Text',
            created_by  : 'Created by',
          } )
          .end( ( err,res ) => {
            expect( res.status ).to.equal( 200 );
            expect( res.body   ).to.have.property( '_id'         );
            expect( res.body   ).to.have.property( 'issue_title' ).to.equal( 'Required fields filled in' );
            expect( res.body   ).to.have.property( 'issue_text'  ).to.equal( 'Text' );
            expect( res.body   ).to.have.property( 'created_by'  ).to.equal( 'Created by' );
            expect( res.body   ).to.have.property( 'assigned_to' ).to.equal( '' );
            expect( res.body   ).to.have.property( 'status_text' ).to.equal( '' );
            expect( res.body   ).to.have.property( 'open'        ).to.be.a( 'boolean' ).and.to.equal( true );
            expect( res.body   ).to.have.property( 'created_on'  );
            expect( res.body   ).to.have.property( 'updated_on'  );
            done( );
          } );
      } );

      test( 'Missing required fields', ( done ) => {
        chai.request( server )
          .post( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .send( {
            issue_title : 'Missing required fields',
            issue_text  : 'Property "assigned_to" was not filled',
          } )
          .end( ( err,res ) => {
            expect( res.status ).to.equal( 200 );
            expect( res.text )
              .to.equal( 'Sorry, but "issue_title", "issue_text" and "created_by" are all required' );
            done( );
          } );
      } );

    });

    suite( 'PUT /api/issues/{project} => text', ( ) => {
      
      test( 'No body', ( done ) => {
        chai.request( server )
          .put( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .send( { _id : firstInsertedID } )
          .end( ( err,res ) => {
            expect( res.status ).to.equal( 200 );
            expect( res.text ).to.equal( 'no updated field sent' );
            done( );
          } );
      } );

      test( 'One field to update', ( done ) => {
        chai.request( server )
          .put( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .send( {_id: firstInsertedID, issue_title: 'One field to update'} )
          .end( ( err,res ) => {
            expect( res.status ).to.equal( 200 );
            expect( res.text ).to.equal( 'successfully updated' );
            done( );
          } );
      } );

      test( 'Multiple fields to update', ( done ) => {
        chai.request( server )
          .put( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .send( {
            _id         : firstInsertedID,
            issue_title : 'Multiple fields to update',
            issue_text  : 'Another field updated'
          } )
          .end( ( err,res ) => {
            expect( res.status ).to.equal( 200 );
            expect( res.text ).to.equal( 'successfully updated' );
            done( );
          } );
      } );

    });

    suite( 'GET /api/issues/{project} => Array of objects with issue data', ( ) => {
      
      test( 'No filter', ( done ) => {
        chai.request( server )
          .get( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .query( { } )
          .end( ( err,res ) => {
            expect( res.status ).to.equal( 200 );
            expect( res.body ).is.a( 'array' );
            expect( res.body[0] ).to.have.property( '_id'         );
            expect( res.body[0] ).to.have.property( 'issue_title' );
            expect( res.body[0] ).to.have.property( 'issue_text'  );
            expect( res.body[0] ).to.have.property( 'assigned_to' );
            expect( res.body[0] ).to.have.property( 'status_text' );
            expect( res.body[0] ).to.have.property( 'created_by'  );
            expect( res.body[0] ).to.have.property( 'created_on'  );
            expect( res.body[0] ).to.have.property( 'updated_on'  );
            expect( res.body[0] ).to.have.property( 'open'        );
            done( );
          } );
      });

      test( 'One filter', ( done ) => {
        chai.request( server )
          .get( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .query( { status_text: 'Filter me' } )
          .end( ( err,res ) => {
            expect( res.status ).to.equal( 200 );
            expect( res.body ).is.a( 'array' );
            expect( res.body[0] ).to.have.property( 'status_text' ).to.equal( 'Filter me' );
            expect( res.body[0] ).to.have.property( '_id'         );
            expect( res.body[0] ).to.have.property( 'issue_title' );
            expect( res.body[0] ).to.have.property( 'issue_text'  );
            expect( res.body[0] ).to.have.property( 'assigned_to' );
            expect( res.body[0] ).to.have.property( 'created_by'  );
            expect( res.body[0] ).to.have.property( 'created_on'  );
            expect( res.body[0] ).to.have.property( 'updated_on'  );
            expect( res.body[0] ).to.have.property( 'open'        );
            done( );
          } );
      } );

      test( 'Multiple filters (test for multiple fields you know will be in the db for a return)', ( done ) => {
        chai.request( server )
          .get( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .query( { issue_title: 'Multiple fields to update', status_text: 'Filter me'  } )
          .end( ( err,res ) => {
            expect( res.status ).to.equal( 200 );
            expect( res.body ).is.a( 'array' );
            expect( res.body[0] ).to.have.property( '_id'         );
            expect( res.body[0] ).to.have.property( 'issue_title' ).to.equal( 'Multiple fields to update' );
            expect( res.body[0] ).to.have.property( 'issue_text'  ).to.equal( 'Another field updated' );
            expect( res.body[0] ).to.have.property( 'assigned_to' ).to.equal( 'Assigned to' );
            expect( res.body[0] ).to.have.property( 'status_text' ).to.equal( 'Filter me' );
            expect( res.body[0] ).to.have.property( 'created_by'  ).to.equal( 'Created by' );
            expect( res.body[0] ).to.have.property( 'created_on'  );
            expect( res.body[0] ).to.have.property( 'updated_on'  );
            expect( res.body[0] ).to.have.property( 'open'        ).to.equal( true );
            done( );
          } );
      });

    });

    suite( 'DELETE /api/issues/{project} => text', ( ) => {
      
      test( 'No _id', ( done ) => {
        chai.request( server )
          .delete( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .send( { } )
          .end( ( err,res ) => {
            expect( res.text ).to.equal( '_id error' );
            done( );
          } );
      } );

      test( 'Valid _id', ( done ) => {
        chai.request( server )
          .delete( '/api/issues/test' )
          .set( 'content-type', 'application/x-www-form-urlencoded' )
          .send( { _id: firstInsertedID } )
          .end( ( err,res ) => {
            expect( res.text ).to.equal( `deleted ${ firstInsertedID }` );
            done( );
          } );
      } );

    } );

});
