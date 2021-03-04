//INICIALIZO VARIAVEIS
var timeout = 5000;
var num_perg = 0;
var acertos = 0;
var erros = 0;
var pulos = 3;
var eliminar = 1;

var lista_score = JSON.parse(localStorage.getItem('lista-score') || '[]');

window.fn = {};

window.fn.toggleMenu = function () {
  document.getElementById('appSplitter').right.toggle();
};

window.fn.loadView = function (index) {
  document.getElementById('appTabbar').setActiveTab(index);
  document.getElementById('sidemenu').close();
};

window.fn.loadLink = function (url) {
  window.open(url, '_blank');
};

window.fn.pushPage = function (page, anim) {
  if (anim) {
    document.getElementById('appNavigator').pushPage(page.id, { data: { title: page.title }, animation: anim });
  } else {
    document.getElementById('appNavigator').pushPage(page.id, { data: { title: page.title } });
  }
};

// SCRIPT PARA CRIAR O MODAL DE AGUARDE
window.fn.showDialog = function (id) {
  var elem = document.getElementById(id);      
  elem.show();            
};

//SCRIPT PARA ESCONDER O MODAL DE AGUARDE
window.fn.hideDialog = function (id) {
  document.getElementById(id).hide();
};

function maxArray(array) {
  return Math.max.apply(Math, array);
};

var app = {
  // Application Constructor
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },
  // deviceready Event Handler    
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    this.receivedEvent('deviceready');  
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    this.oneSignal();
    this.getIds();
  },
  oneSignal: function() {
    window.plugins.OneSignal
    .startInit("c890bf70-f20d-4d2d-ab10-4a75230489a2")   
    .handleNotificationOpened(function(jsonData) {
      var mensagem = JSON.parse(JSON.stringify(jsonData['notification']['payload']['additionalData']['mensagem']));
      var titulo = JSON.parse(JSON.stringify(jsonData['notification']['payload']['additionalData']['titulo']));
      ons.notification.alert(
        mensagem,
        {title: titulo}
      );
    })
    .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
    .endInit();
  },
  //FUNÇÃO DE BUSCA
  onSearchKeyDown: function(id) {
    if (id === '') {
      return false;
    }
    else{}
  },
  buscaPergunta: function(num_pergunta) {
    $("#textoquiz").html('');
    var selector = this;
    //BUSCO AS PERGUNTAS
    var data = JSON.parse(localStorage.getItem('lista-quiz'));

    //VERIFICO SE EXISTE PERGUNTAS
    if (data) {      
      $(selector).each(function(){
        var pergunta = null;
        var respostas = null;
        var resposta = null;        
        var obj = {
          id : num_pergunta,
          opcoes : ""
        };
        var total_perguntas = 0;

        for(i in data){
          total_perguntas++
          //CARREGO A PERGUNTA ATUAL
          if(i == obj.id){
            pergunta = data[i]['pergunta'];
            respostas = data[i]['opcoes'];
            resposta = data[i]['resposta'];
            //PASSO A PERGUNTA ATUAL PARA UMA VARIAVEL
            var perguntaAtual = data[i];
          }
        }

        if (pergunta) {            
          obj.opcoes = '<ons-list-header style="font-size: 25px;">'+(num_pergunta+1)+' - '+pergunta+'</ons-list-header>';
          for (var i in respostas) {
            if (respostas[i]) {
              obj.opcoes += 
              '<ons-list-item tappable style="font-size: 20px;">'+
              '    <label class="left">'+
              "      <ons-radio class='quiz_' input-id='quiz"+i+"' value='"+respostas[i]+"'></ons-radio>"+
              '    </label>'+
              '    <label for="quiz'+i+'" class="center">'+respostas[i]+'</label>'+
              '</ons-list-item>';
            }
          }
        }
                  
        obj.opcoes +=
        '<ons-list-item tappable modifier="longdivider" style="display: none;">'+
        '    <label class="left">'+
        '      <ons-radio class="quiz_" input-id="quiz_" value=""></ons-radio>'+
        '    </label>'+
        '    <label for="quiz_" class="center">nenhum</label>'+
        '</ons-list-item>';

        obj.opcoes +=
        '<section style="margin: 20px">'+
        '  <ons-button modifier="large" style="padding: 10px;box-shadow:0 5px 0 #ccc;" class="button-margin responder">RESPONDER</ons-button>'+
        '  <ons-row>'+
        '      <ons-col style="margin-right: 10px;">'+
        '          <ons-button modifier="large" style="padding: 10px;box-shadow:0 5px 0 #ccc;" class="button-margin pular">PULAR ('+pulos+'X)</ons-button>'+
        '      </ons-col>'+
        '      <ons-col>'+
        '          <ons-button modifier="large" style="padding: 10px;box-shadow:0 5px 0 #ccc;" class="button-margin eliminar">ELIMINAR ('+eliminar+'X)</ons-button>'+
        '      </ons-col>'+
        '  </ons-row>'+
        '  <ons-button modifier="large" style="padding: 10px;box-shadow:0 5px 0 #ccc;" class="button-margin finalizar">FINALIZAR</ons-button>'+

        '</section>';

        $("#textoquiz").html(obj.opcoes);

        var currentId = 'quiz_';
        var currentValue = '';
        const radios = document.querySelectorAll('.quiz_');

        for (var i = 0; i < radios.length; i++) {
          var radio = radios[i];
          radio.addEventListener('change', function (event) {
            if (event.target.value !== currentValue) {
                document.getElementById(currentId).checked = false;
                currentId = event.target.id;
                currentValue = event.target.value;
            }
          })
        }

        //BOTAO RESPONDER
        $( ".responder" ).click(function() {
          //VERIFICO SE SELECIONOU ALGUMA OPCAO
          if (currentValue != '') {
            //SE A RESPOSTA ESTIVER ERRADA
            if (currentValue != resposta) {
              //PEGO A LISTA DE PERGUNTAS
              var data = JSON.parse(localStorage.getItem('lista-quiz'));
              //ACRESCENTO AO FINAL A PERGUNTA QUE O JOGADOR ERROU
              data.push(perguntaAtual);
              //SALVO A NOVA LISTA
              localStorage.setItem("lista-quiz", JSON.stringify(data));
              //INCREMENTO A QUANTIDADE DE PERGUNTAS
              total_perguntas++;             
              //INCREMENTO OS ERROS
              erros++
              //EXIBO A MENSAGEM DE ERRO 
              ons.notification.alert({
                message: 'A resposta correta é: '+resposta,
                title: 'Resposta errada!',

                callback: function (index) {
                  if (0 == index) {
                    //INCREMENTO PARA A PROXIMA PERGUNTA
                    num_perg++;
                    //VERIFICO SE AINDA NAO CHEGOU AO FINAL DAS PERGUNTAS
                    if (num_perg < total_perguntas) {
                      //BUSCO A PROXIMA PERGUNTA
                      app.buscaPergunta(num_perg);
                    }
                    else{
                      //CASO TENHA ACERTADO ALGUMA PERGUNTA SALVO NO SCORE
                      if (acertos > 0) {
                        lista_score.push(acertos);
                        localStorage.setItem("lista-score", JSON.stringify(lista_score));              
                      }
                      ons.notification.alert({
                        message: 'Parabêns! Você chegou ao fim do quiz.<br><br>Sua pontuação: '+acertos,
                        title: 'Mensagem',
                        callback: function (index) {
                          if (0 == index) {
                            location.href = 'index.html';
                          }
                        }
                      });
                    }
                  }
                }
              });
            }
            //RESPOSTA CERTA
            else{
              acertos++
              ons.notification.alert({
                message: 'Resposta certa!',
                title: 'Mensagem',
                callback: function (index) {
                  if (0 == index) {
                    num_perg++;
                    if (num_perg < total_perguntas) {
                      app.buscaPergunta(num_perg);
                    }
                    else{                  
                      ons.notification.alert({
                        message: 'Parabêns! Você chegou ao fim do quiz.<br><br>Sua pontuação: '+acertos,
                        title: 'Mensagem',
                        callback: function (index) {
                          if (0 == index) {
                            location.href = 'index.html';
                          }
                          else{}
                        }
                      });
                    }
                  }
                  else{}
                }
              });
            }
            currentId = 'quiz_';
            currentValue = '';


            if (acertos > 0) {
              lista_score.push(acertos);
              localStorage.setItem("lista-score", JSON.stringify(lista_score));              
            }
            $('.quiz_').prop('checked', false);
            $('#acerto').html('Acertos: '+acertos);
            $('#erro').html('Erros: '+erros);
          }
          else{
            ons.notification.alert({
              message: 'Escolha uma opção!',
              title: 'Mensagem',
            });
          }
        });

        //BOTAO PULAR
        $( ".pular" ).click(function() {
          //VERIFICO SE PODE PULAR
          if (pulos > 0) {
            //PEGO A LISTA DE PERGUNTAS
            var data = JSON.parse(localStorage.getItem('lista-quiz'));
            //ACRESCENTO AO FINAL A PERGUNTA QUE O JOGADOR PULOU
            data.push(perguntaAtual);
            //SALVO A NOVA LISTA
            localStorage.setItem("lista-quiz", JSON.stringify(data));
            //INCREMENTO A QUANTIDADE DE PERGUNTAS
            total_perguntas++;

            currentId = 'quiz_';
            currentValue = '';
            num_perg++;
            pulos--;

            if (num_perg < total_perguntas) {
              app.buscaPergunta(num_perg);
            }
            else{
              //CASO TENHA ACERTADO ALGUMA PERGUNTA SALVO NO SCORE
              if (acertos > 0) {
                lista_score.push(acertos);
                localStorage.setItem("lista-score", JSON.stringify(lista_score));              
              }
              ons.notification.alert({
                message: 'Parabêns! Você chegou ao fim do quiz.<br><br>Sua pontuação: '+acertos,
                title: 'Mensagem',
                callback: function (index) {
                  if (0 == index) {
                    location.href = 'index.html';
                  }
                }
              });
            }
          }
          else{
            ons.notification.alert({
              message: 'Você não pode pular mais nenhuma pergunta.',
              title: 'Atenção'
            });
          }
        });

        //BOTAO ELIMINAR
        $( ".eliminar" ).click(function() {
          //VERIFICO SE PODE ELIMINAR UMA PERGUNTA
          if (eliminar > 0) {
            //INCREMENTO 1 ACERTO
            acertos++
            $('#acerto').html('Acertos: '+acertos);
            currentId = 'quiz_';
            currentValue = '';
            num_perg++;
            eliminar--;

            if (num_perg < total_perguntas) {
              app.buscaPergunta(num_perg);
            }
            else{
              //CASO TENHA ACERTADO ALGUMA PERGUNTA SALVO NO SCORE
              if (acertos > 0) {
                lista_score.push(acertos);
                localStorage.setItem("lista-score", JSON.stringify(lista_score));              
              }
              ons.notification.alert({
                message: 'Parabêns! Você chegou ao fim do quiz.<br><br>Sua pontuação: '+acertos,
                title: 'Mensagem',
                callback: function (index) {
                  if (0 == index) {
                    location.href = 'index.html';
                  }
                }
              });
            }
          }
          else{
            ons.notification.alert({
              message: 'Você não pode eliminar mais nenhuma pergunta.',
              title: 'Atenção'
            });
          }
        });

        $( ".finalizar" ).click(function() { 
          if (acertos > 0) {
            lista_score.push(acertos);
            localStorage.setItem("lista-score", JSON.stringify(lista_score));              
          }
          ons.notification.alert({
            message: 'Sua pontuação: '+acertos,
            title: 'Mensagem',
            callback: function (index) {
              if (0 == index) {
                location.href = 'index.html';
              }
              else{
              }
            }
          });
        });
      });        
    }
    else{
        opcoes =
        '<section style="margin: 20px">'+
        '  <ons-list-header>'+
        '      <div class="left">'+
        '      </div>'+
        '      <div class="center intro" style="font-size: 25px">'+
        '          <p>Volte para carregar as perguntas!</p>'+
        '      </div>'+
        '  </ons-list-header>'+
        '</section>';

      $("#textoquiz").html(opcoes);
    }
  },
  carregaQuiz: function() {
    localStorage.removeItem('lista-quiz');
    var quiz = "quiz";
    $.ajax({
      type : "GET",
      url : "js/"+quiz+".json",
      dataType : "json",
      success : function(data){
        if (data) {
          lista_quiz = app.shuffleArray(data);
          localStorage.setItem("lista-quiz", JSON.stringify(lista_quiz));              
        }
        app.buscaPergunta(num_perg);
      }
    });
  },
  shuffleArray: function(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  },
  dateTime: function() {
    let now = new Date;
    let ano = now.getFullYear();
    let mes = now.getMonth() + 1;
    let dia = now.getDate();

    let hora = now.getHours();
    let min = now.getMinutes();
    let seg = now.getSeconds();

    if (parseInt(mes) < 10) {
      mes = '0'+mes;
    }
    if (parseInt(dia) < 10) {
      dia = '0'+dia;
    }
    if (parseInt(hora) < 10) {
      hora = '0'+hora;
    }
    if (parseInt(min) < 10) {
      min = '0'+min;
    }
    if (parseInt(seg) < 10) {
      seg = '0'+seg;
    }
    return ano+'-'+mes+'-'+dia+' '+hora+':'+min+':'+seg;
  },
  cadastraUser: function() {
    var playerID = window.localStorage.getItem('playerID');
    var pushToken = window.localStorage.getItem('pushToken');
    var uid = window.localStorage.getItem('uid');
    
    if (playerID && uid) {
      $.ajax({
        url: "https://www.innovatesoft.com.br/webservice/app/cadastraUser.php",
        dataType: 'html',
        type: 'POST',
        data: {
          'userId': playerID,
          'pushToken': pushToken,
          'uid': uid,
          'datacadastro': this.dateTime(),
          'ultimoacesso': this.dateTime(),
          'app': 'quiz',
        },
        error: function(e) {
        },
        success: function(a) {
        },
      });
    }
  },
  cadastraScore: function() {
    var uid = window.localStorage.getItem('uid');
    var maxScore = null;
    var arr = localStorage.getItem('lista-score');
    if (arr) {
        maxScore = maxArray(JSON.parse(arr));
    }
    if (uid) {
      $.ajax({
        url: "https://www.innovatesoft.com.br/webservice/app/cadastraScoreQuiz.php",
        dataType: 'html',
        type: 'POST',
        data: {
          'uid': uid,
          'score': maxScore,
          'dataregistro': this.dateTime()
        },
        error: function(e) {
        },
        success: function(a) {
        },
      });
    }
  },
  getIds: function() {
    window.plugins.OneSignal.getIds(function(ids) {
      window.localStorage.setItem('playerID', ids.userId);
      window.localStorage.setItem('pushToken', ids.pushToken);
    });

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        window.localStorage.setItem('uid',uid);
      }
    });

    this.cadastraUser();
  }
};

app.initialize();