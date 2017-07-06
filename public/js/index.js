        $("#btn").click(function() {

            $.ajax({
                url: "/api/user/register",
                type: "post",
                data: {
                    username: $("input[name='username']").val(),
                    email: $("input[name='email'").val(),
                    content: $("textarea[name='content'").val()

                },
                success: function(data) {
                    alert(data.code);
                },
                dataType: "json"
            })
        })