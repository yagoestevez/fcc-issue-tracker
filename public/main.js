$( ( ) => {
  const currentProject = 'Test-DB';
  const url            = `/api/issues/${currentProject}`;

  $.ajax( {
    type    : "GET",
    url     : url,
    success : data => {
      let issues = '';
      data.forEach( issue => {
        const openStatus = issue.open ? 'OPEN' : 'CLOSED';
        const visibility = openStatus === 'CLOSED' ? 'hidden' : '';
        const card = `
          <div class="card card-block col-12 col-md-5 col-xl-3">
            <div class="card-header text-white ${openStatus==='CLOSED' ? 'bg-lightgreen' : 'bg-danger'}">
              <h4 class="card-title">${issue.issue_title}</h4>
              <p><small>Created by: ${issue.created_by}</small></p>
              <b>${openStatus}</b>
            </div>
            <div id="card-body" class="card-body text-left">
              <h5><b>Description</b>:<h5/>
              <p>${issue.issue_text}<p/>
              <hr/>
              <p><small><b>ID:</b> ${issue._id}</small></p>
              <hr/>
              <p><small><b>Created on:</b><br/> ${moment(issue.created_on, "x").format("DD MMM YYYY hh:mm a")}</small></p>
              <p><small><b>Updated on:</b><br/> ${moment(issue.updated_on, "x").format("DD MMM YYYY hh:mm a")}</small></p>
            </div>
            <div class="card-footer text-muted">
              <a
                href="#/"
                id="${issue._id}"
                class="btn btn-sm btn-outline-primary mx-2 closeIssue ${visibility}"
                >
                  Close Issue
              </a>
              <a
                href="#/"
                id="${issue._id}"
                class="btn btn-sm btn-danger mx-2 deleteIssue"
                >
                  Delete Issue
              </a>
            </div>
          </div>
        `;
        issues += card;
      });
      $( '#displayIssues' ).html( issues );
      $( '#displayTitle' ).html( issues ? 'Showing all issues' : 'No pending issues' );
    }
  } );

  $( '#newIssue' ).submit( function ( event ) {
    event.preventDefault( );
    $( this ).attr( 'action', `/api/issues/${currentProject}` );
    $.ajax( {
      type    : 'POST',
      url     : url,
      data    : $( this ).serialize( ),
      success : data => window.location.reload( true )
    } );
  } );

  $( '#displayIssues' ).on( 'click', '.closeIssue', function ( event ) {
    event.preventDefault( );
    $.ajax( {
      type    : 'PUT',
      url     : url,
      data    : { _id: $( this ).attr( 'id' ), open: false },
      success : data => {
        $( '#mySmallModalLabel' ).text( 'Done. Updating issues.' );
        $( '#modalContent' ).text( `${data}` );
        $( '.modal' ).modal( 'show' );
        setTimeout( () => window.location.reload( true ), 1500 );
      }
    } );
  } );

  $( '#displayIssues' ).on( 'click', '.deleteIssue', function ( event ) {
    event.preventDefault( );
    $.ajax( {
      type    : 'DELETE',
      url     : url,
      data    : { _id: $( this ).attr( 'id' ) },
      success : data => {
        $( '#mySmallModalLabel' ).text( 'Done. Updating issues.' );
        $( '#modalContent' ).text( `${data}` );
        $( '.modal' ).modal( 'show' );
        setTimeout( () => window.location.reload( true ), 1500 );
      }
    } );
  } );

} );