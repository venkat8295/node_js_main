
$('#post_image_button').on('click',function(){
  $(".post_image").show(1000);
  $(".hide_post").show(1000);
});
$('.hide_post').click(function(){
  $('.post_image').hide(1000);
  $(".hide_post").hide(1000);
});

$('.append_commenter').append('.commenter');

var button_id="";
var i =1;
$('#add').click(function(){
  i++;
  $('#dynamic_field').append('</br><tr id="comments'+i+'"><td><input type="text" name="comments" class="form-control comments" placeholder="Comments Here"></td><td><button type="button" name="remove_comment" id="'+i+'" class="btn btn-danger btn_remove">X</button></td><td><button type="submit" id="'+i+'" class="btn btn-info btn_save">Save</button></td></tr>');
});

$(document).on('click','.btn_remove',function(){
  button_id = $(this).attr('id');
  $('#comments'+button_id).remove();
});
$(document).on('click','.btn_save',function(){
  var button_id = $(this).attr('id');
  var comments_data = $(this).parents('#dynamic_field').find('#comments'+button_id).find('.comments').val();
  var returnval = false;
  console.log("comments_data:",comments_data);
  var data_comments = {comments: comments_data};
  var form_data = $("#comments_form").serialize();
  if(comments_data == ""){
    alert("Please Fill The Comments To Save!");
    return false;
  }
  else
  {

    $.ajax({
      type: 'POST',
      url: '/users/dashboard',
      data: form_data,
      dataType:"JSON",
      success: function(data){
        //do something with the data via front-end framework
        //location.reload();
        //returnval = true;
        console.log("data123:",data.comments);
        var inc_compare = data.comments.length-1;
        for(var i=0;i<data.comments.length;i++)
        {
          if(inc_compare == i){
            console.log("data.comments[i]:",data.comments[i]);
            $('#dynamic_field').append('<tr class="dynamic_comments"><td><input type="text" class="form-control comments" value="'+data.comments[i]+'" reaonly></td></tr>');
          }
          $('.dynamic_comments').remove();
          //$('.db_update').append('<tr><td><h4 class="text-muted">Commented By</h4><h5 style="color:#41B5D8;">"'+data.username+'"</h5></br></td></tr>');
          //$(".db_update").val(data.comments[i]);
        }
        location.reload();
      }
    });

    return returnval;

  }

});

/*
var username = "";
$.getJSON( "username.json", function(result) {
  console.log( "success",result.username);
  username = result.username;
})
  .done(function(data) {
    console.log( "second success",data.username);
  })
  .fail(function() {
    console.log( "error" );
  })
  .always(function() {
    console.log( "complete" );
  });

  console.log('username:',username);
var characterTemplate = $("#character-template").html();
var compiled_character_Template = Handlebars.compile(characterTemplate);
$('character-list-container').html(compiled_character_Template({name:username}));
console.log("compiled_character_template:",compiled_character_Template({name:username}));

    var item = $('form input');
    var todo = {item: item.val()};

    $.ajax({
      type: 'GET',
      url: '/users/dashboard',
      data: todo,
      success: function(data){
        //do something with the data via front-end framework
        location.reload();
      }
    });
*/
