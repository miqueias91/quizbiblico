//INICIALIZO VARIAVEIS
var timeout = 5000;
var num_perg = 0;
var acertos = 0;
var erros = 0;
var pulos = 3;
var eliminar = 1;
var admobid = {}
if (/(android)/i.test(navigator.userAgent)) {  // for android & amazon-fireos
    admobid = {
        banner: 'ca-app-pub-7091486462236476/4321637167',
        interstitial: 'ca-app-pub-7091486462236476/6301767394',
    }
}
var lista_score = JSON.parse(localStorage.getItem('lista-score') || '[]');
window.localStorage.setItem("versao_pro", 'NAO');

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
        document.addEventListener('admob.banner.events.LOAD_FAIL', function(event) {});
        document.addEventListener('admob.interstitial.events.LOAD_FAIL', function(event) {});
        document.addEventListener('admob.interstitial.events.LOAD', function(event) {
            document.getElementsByClassName('showAd').disabled = false
        });
        document.addEventListener('admob.interstitial.events.CLOSE', function(event) {
            admob.interstitial.prepare()
        });
    },
    // deviceready Event Handler
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        this.firebase();
        this.oneSignal();
        this.getIds();
        this.buscaDadosUsuario();
        this.admob();
        this.buscaNotificacoes();
    },
    oneSignal: function() {
        window.plugins.OneSignal
        .startInit("f23cc8fe-bec5-43ae-b875-1f0e3ffb7fba")
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
              'app': 'quiz_v2',
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
         var playerID = window.localStorage.getItem('playerID');
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
              'userId': playerID,
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
      },
    verificaExistenciaUsuario: function(usuario, religiao, nome, email, celular) {
          var uid = window.localStorage.getItem('uid');
          var playerID = window.localStorage.getItem('playerID');
          if (usuario != "") {
            fn.showDialog('modal-aguarde');
            $.ajax({
              url: "https://www.innovatesoft.com.br/webservice/app/verificaExistenciaUsuario.php?usuario="+usuario,
              dataType: 'json',
              type: 'POST',
              data: {
                'nome': nome,
                'email': email,
                'religiao': religiao,
                'celular': celular,
                'uid': uid,
                'userId': playerID,
              },
              error: function(e) {
                var timeoutID = 0;
                clearTimeout(timeoutID);
                timeoutID = setTimeout(function() { fn.hideDialog('modal-aguarde') }, 100);
                ons.notification.alert(
                  'Verifique sua conexão com a internet!',
                  {title: 'Erro'}
                );
              },
              success: function(a) {
                var timeoutID = 0;
                clearTimeout(timeoutID);
                timeoutID = setTimeout(function() { fn.hideDialog('modal-aguarde') }, 100);
                if (a == true) {
                  ons.notification.alert(
                    'Escolha outro usuário!',
                    {title: 'Erro'}
                  );
                }
                else{
                  window.localStorage.setItem("usuario", usuario);
                  window.localStorage.setItem("nome", nome);
                  window.localStorage.setItem("email", email);
                  window.localStorage.setItem("religiao", religiao);
                  window.localStorage.setItem("celular", celular);
                  ons.notification.alert(
                    'Dados atualizados com sucesso!',
                    {title: 'Sucesso'}
                  );
                }
              },
            });
          }
        },
    buscaDadosUsuario: function() {
      var uid = window.localStorage.getItem('uid');
      var playerID = window.localStorage.getItem('playerID');
      if (uid) {
        $.ajax({
          url: "https://www.innovatesoft.com.br/webservice/app/buscaDadosUsuario.php",
          dataType: 'json',
          type: 'POST',
          async: true,
          data: {
            'uid': uid,
            'userId': playerID,
          },
          success: function(a) {
            if (a) {
              window.localStorage.setItem("nome", a['nome']);
              window.localStorage.setItem("usuario", a['usuario']);
              window.localStorage.setItem("email", a['email']);
              window.localStorage.setItem("celular", a['celular']);
              window.localStorage.setItem("religiao", a['religiao']);
              if (a['final_versao_pro'] == null) {
                a['final_versao_pro'] = 'NAO';
              }
              window.localStorage.setItem("versao_pro", a['final_versao_pro']);
            }
          },
        });
      }
    },
    admob: function(){
      window.plugins.insomnia.keepAwake();
      admob.banner.config({ 
        id: admobid.banner, 
        isTesting: false, 
        autoShow: true, 
      })

      if (window.localStorage.getItem("versao_pro") === 'NAO') {
        admob.banner.prepare()
      }
      
      admob.interstitial.config({
        id: admobid.interstitial,
        isTesting: false,
        autoShow: false,
      })

      if (window.localStorage.getItem("versao_pro") === 'NAO') {
        admob.interstitial.prepare()
      }

      document.getElementsByClassName('showAd').disabled = true
      document.getElementsByClassName('showAd').onclick = function() {
        admob.interstitial.show()
      }
    },
    firebase: function(){
      // Your web app's Firebase configuration
      var firebaseConfig = {
        apiKey: "AIzaSyCOEIXQBRTLNlKxtYjpu857DtqgSb8SZrE",
        authDomain: "quiz-biblico-23c08.firebaseapp.com",
        projectId: "quiz-biblico-23c08",
        storageBucket: "quiz-biblico-23c08.appspot.com",
        messagingSenderId: "765359532797",
        appId: "1:765359532797:web:e0177649bd39c60c256c94",
        measurementId: "G-DQY0Q8H1Q7"
      };

      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      firebase.analytics();

      firebase.auth().signInAnonymously().catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage)
      });
    }
};

app.initialize();