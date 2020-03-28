
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';


import * as AWS from "aws-sdk";
import * as awsservice from "aws-sdk/lib/service";
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import * as AWSCognito from 'amazon-cognito-identity-js';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, 
  CognitoAccessToken,CognitoIdToken,CognitoRefreshToken, CognitoUserSession } from 'amazon-cognito-identity-js';
import { stringType } from 'aws-sdk/clients/iam';


//declare let AWS: any;
//declare let AWSCognito: any;
declare let apigClientFactory: any;

export interface Callback {
  cognitoCallback(message: string, result: any):void;
  cognitoCallbackWithCreds(message: string, result: any, creds: any, data:any):void;
  forgotPasswordCallback(message:string, result:any):void
  forgotPasswordValidateCallback(message:string, result:any):void
  registerUserCallback(message:string, result:any):void
  
  //googleCallback(creds: any, profile: any);
  //googleCallbackWithData(data: any);
  //testCallback(result:any, err:any);
}

@Injectable()
export class AwsService {
  token:string;
  googleCreds:any;
  googleProfile:any;
  googleData:any;
  userData:any;
  user:any;

 /************ RESOURCE IDENTIFIERS *************/

  googleId:string = 'XXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com';
  poolData = { 
        //UserPoolId : 'us-east-1_urqg2WODX', //CognitoUserPool under auth provider cognito
        //ClientId : '3eluj53lmpep2sok96t97nlt4l', //CognitoUserPoolClient 
        UserPoolId : 'us-east-1_iuOaSqliV', //CognitoUserPool under auth provider cognito in federated id
        ClientId : '7hpiatbq2vjg672g9f522tjhka', //CognitoUserPoolClient from pool
        Paranoia : 7
    };
  //identityPool:string = 'us-east-1:bda549c7-2bbd-4b89-b77b-13f262a5ed53'; //CognitoIdentityPool 
  //apiURL:string = 'https://qhz4083ysl.execute-api.us-east-1.amazonaws.com/demoxxxxxx';  //ApiUrl in the stage 
  identityPool:string = 'us-east-1:5d31c018-7e8a-4ace-a237-9b6cf92127aa'; //CognitoIdentityPool 
  apiURL:string = 'https://tyyzqr1pd0.execute-api.us-east-1.amazonaws.com/alpha/';  //ApiUrl in the stage 
  region:string = 'us-east-1'; //Region Matching CognitoUserPool region

 /*********************************************/

  constructor(private _http:Http) {
    AWS.config.update({
      region: this.region,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: ''
      })
    });
    AWS.config.region = this.region;
    AWS.config.update({accessKeyId: 'null', secretAccessKey: 'null'});
    console.log("AWS SERVICE RESTARTED")
   }

  

  setGoogleCreds(googleCreds){
    this.googleCreds=googleCreds;
  }

  getgoogleCreds(callback){
    callback.googleCallback(this.googleCreds);
    return this.googleCreds;
  }

  setGoogleProfile(googleProfile){
    this.googleProfile=googleProfile;
  }

  getgoogleProfile(callback){
    callback.googleCallback(this.googleProfile);
    return this.googleProfile;
  }

  getgoogleData(callback){
    callback.googleCallback(this.googleCreds,this.getgoogleProfile);
    let googleData = {
        awsCreds : this.googleCreds,
        googleProfile : this.getgoogleProfile
      };
    return googleData;
  }
  

  authenticateGoogle(authResult,region,profile,callback){
    // Add the Google access token to the Cognito credentials login map.
     AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: this.identityPool,
        Logins: {
           'accounts.google.com': authResult['id_token']
        }
     });

     // Obtain AWS credentials
     AWS.config.getCredentials(function(){
        // Access AWS resources here.
        let creds = {
          accessKey: AWS.config.credentials.accessKeyId,
          secretKey: AWS.config.credentials.secretAccessKey,
          sessionToken: AWS.config.credentials.sessionToken
        };
        let googleData = {
          awsCreds : creds,
          googleProfile : profile
        };
        callback.googleCallback(creds,profile);
      });

  }

  userInfoApiGoogle(accessKey,secretKey,sessionToken,name,surname,email,region,callback){
    let body = {
      name : name,
      surname : surname,
      email: email
    };

    let userData;

    let apigClient = apigClientFactory.newClient({
        accessKey: accessKey,
        secretKey: secretKey,
        sessionToken: sessionToken,
        region: region // The region where the API is deployed
    });
    apigClient.googlePost({},body,{})
      .then(function(response) {
        console.log("Send user data to API");
      }).catch(function (response) {
        console.log(response);
    });
    apigClient.googleGet({},{})
      .then(function(response) {
        console.log("Retrieve data from API");
        userData = response.data.Items[0];
        callback.googleCallbackWithData(userData);
      }).catch(function (response) {
        console.log(response);
      });
  }

  changePassword(user,oldpwd,newpwd,callback){

    let userPool = new AWSCognito.CognitoUserPool(this.poolData);
    let cognitoUser = userPool.getCurrentUser();
    cognitoUser.getSession(function (err, session) {
      if (err) {
          alert(err);
          return;
      }
  });
    if (cognitoUser != null) {
      console.log("cog user is not null " +user)
      cognitoUser.changePassword(oldpwd, newpwd, function(err, result) {
      if (err) {
          console.log(err)
          alert(err);
          return;
      }
      alert("Password Updated")
      console.log('call result: ' + result);
      });
    }

  }

  deleteUser(user){
    this.user = user;
    let userPool = new AWSCognito.CognitoUserPool(this.poolData);
    let userData = {
        Username : user,
        Pool : userPool
    };
    let cognitoUser = new AWSCognito.CognitoUser(userData);
    cognitoUser.deleteUser(function(err, result) {
      if (err) {
          alert(err);
          return;
      }
      console.log('call result: ' + result);
  });
  }

  forgotPassword(user,callback){

    let msg:string =""
    this.user = user;
    let userPool = new AWSCognito.CognitoUserPool(this.poolData);
    let userData = {
        Username : user,
        Pool : userPool
    };
    let cognitoUser = new AWSCognito.CognitoUser(userData);
    
    if (cognitoUser != null) {

    cognitoUser.forgotPassword( {
      onSuccess: function (result) {
        console.log("verification code sent" + result)
        var r= "PASS,"+ result
        callback.forgotPasswordCallback(null, r);
       
      },
      onFailure: function(err) {
         console.log("user not found")
          console.log(err)
          var e= "ERR,"+ err
         callback.forgotPasswordCallback(e, null);
      }
    });
   }
   
  }
  
  logout(user){
    console.log("in logout "+user)
  
    let msg:string =""
    
    let userPool = new AWSCognito.CognitoUserPool(this.poolData);
    let userData = {
        Username : user, 
        Pool : userPool
    };
    let cognitoUser = new AWSCognito.CognitoUser(userData);
        
    if (cognitoUser != null) {
      cognitoUser.signOut()
      console.log("user is logged out")
     
    }

  }

  forgotPasswordValidate(code,newpassword,callback){
    let userPool = new AWSCognito.CognitoUserPool(this.poolData);
    let userData = {
        Username : this.user,
        Pool : userPool
    };
    let cognitoUser = new AWSCognito.CognitoUser(userData);

    if (cognitoUser != null) {
     
        cognitoUser.confirmPassword(code, newpassword, { 
          onFailure: function(err:Error) { console.log("fail") 
          callback.forgotPasswordCallback(null, "ERR");
        }, 
          onSuccess: function() { console.log("pass")
          callback.forgotPasswordCallback("PASS",null);
        } 
    });

  }
    
}

  

  registerUser(username,email, phone, password,office,callback){
    console.log("username us" +username + "email is "+email+" phone is "+phone + "password id " +password)
    console.log(office)
    let userPool = new AWSCognito.CognitoUserPool(this.poolData);
    var attributeList = [];
    var rusername = "";
    var dataEmail = {
        Name : 'email',
        Value : email
    };
    var dataPhoneNumber = {
        Name : 'phone_number',
        Value : phone
    };
    var dataUserName = {
      Name : 'name',
      Value : username
  };
    var dataOffice ={
      Name: 'custom:office',
      Value : office
    };
    var attributeEmail = new AWSCognito.CognitoUserAttribute(dataEmail);
    var attributePhoneNumber = new AWSCognito.CognitoUserAttribute(dataPhoneNumber);
    var attributeUserName = new AWSCognito.CognitoUserAttribute(dataUserName);
    var attributeOffice = new AWSCognito.CognitoUserAttribute(dataOffice);

    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber)
    attributeList.push(attributeUserName)
    attributeList.push(attributeOffice)

    userPool.signUp(username, password, attributeList, null, function(err, result){
      if (err) {
          
          callback.registerUserCallback(err,null);
         
      } else
    
          callback.registerUserCallback(null,result);
    
  });

  }

  refresh(){
    let userPool = new AWSCognito.CognitoUserPool(this.poolData);
    let cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession(function(err, session) {
          if (err) {
              alert(err);
            
              console.log("no token is ...:"+ err)
              return;
          }
          console.log('session validity: ' + session.isValid());
          let token:CognitoIdToken = session.getIdToken().getJwtToken();
          console.log("new token is ...:"+ token)
          
             
      });
  }

  }

  isSessionValid(){
    var ret:boolean;
    console.log("ccaling internals")
    let userPool = new AWSCognito.CognitoUserPool(this.poolData);
    let cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
      ret =cognitoUser.getSession(function(err, session) {
          if (err) {
              console.log("user not logged in")
              return false;
          } else{

            console.log("user logged in");
            return true;
          }
          

      });
  } else { return false;}

  return ret;

  }
  

  
  authenticateUserPool(user,password,callback){
    let authenticationData = {
      Username : user,
      Password : password,
      };
    let authenticationDetails = new AWSCognito.AuthenticationDetails(authenticationData);
    let userPool = new AWSCognito.CognitoUserPool(this.poolData);
    let userData = {
        Username : user,
        Pool : userPool
    };
    let cognitoUser = new AWSCognito.CognitoUser(userData);
    
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        let cognitoGetUser = userPool.getCurrentUser();
        var e= "PASS"
      
        //this.token = result.getIdToken().getJwtToken()
        this.userToken = result.getIdToken().getJwtToken().toString()
        console.log( this.userToken )
        callback.cognitoCallback( e , result.getIdToken().getJwtToken().toString() );
        console.log("==================================")
        
      },
      onFailure: function(err) {
          var e= "ERR," + err
          callback.cognitoCallback(e, null);
      }
    });
  }
/*
  getInfoApiUserPools(token):Observable<any>{
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', token);
    return this._http.get(this.apiURL+"/test", {headers: headers})
        .map(res => res.json().Items[0])
        .catch(this._serverError);

  } */
/*
  postInfoApiUserPools(token):Observable<any>{ 
    let headers = new Headers();
    let body = {};
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', token);
    return this._http.post(this.apiURL+"/test",JSON.stringify(body), {headers: headers})
            .map(res => res.json())
            .catch(this._serverError);
  }*/

  authenticateIdentityPool(user,password,region,callback){
    let authenticationData = {
      Username : user,
      Password : password,
      };
    let authenticationDetails = new AWSCognito.AuthenticationDetails(authenticationData);
    let userPool = new AWSCognito.CognitoUserPool(this.poolData);
    let userData = {
        Username : user,
        Pool : userPool
    };
    let cognitoUser = new AWSCognito.CognitoUser(userData);
    let cognitoParams = {
      IdentityPoolId: this.identityPool,
      Logins: {}
    };
    let poolId = this.poolData.UserPoolId;
    
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        let cognitoGetUser = userPool.getCurrentUser();
        if (cognitoGetUser != null) {
          cognitoGetUser.getSession(function(err, result) {
            if (result) {
              console.log ("Authenticated to Cognito User and Identity Pools!");  
              let token = result.getIdToken().getJwtToken();
              console.log("token is "+ token)
              console.log(token.getCurrentUser)
              cognitoParams.Logins["cognito-idp."+region+".amazonaws.com/"+poolId] = token;
              AWS.config.credentials = new AWS.CognitoIdentityCredentials(cognitoParams);
        
              // Obtain AWS credentials
              AWS.config.getCredentials(function(){
                  // Access AWS resources here.
                  let creds = {
                    accessKey: AWS.config.credentials.accessKeyId,
                    secretKey: AWS.config.credentials.secretAccessKey,
                    sessionToken: AWS.config.credentials.sessionToken
                  };
                  let additionalParams = {
                    headers: {
                      Authorization: token
                    }
                  };
                  let params = {};
                  let body = {};
                  let apigClient = apigClientFactory.newClient({
                      accessKey: AWS.config.credentials.accessKeyId,
                      secretKey: AWS.config.credentials.secretAccessKey,
                      sessionToken: AWS.config.credentials.sessionToken,
                      region: region // The region where the API is deployed
                  });
                  let apigClientJWT = apigClientFactory.newClient();
                  apigClientJWT.cipInfoGet({},{},additionalParams)
                    .then(function(response) {
                      body = response.data.Item;
                      console.log("Retrieving User Attributes from User Pool");
                      if (body != null){
                        apigClient.cipPost({},body,{})
                          .then(function(response) {
                            console.log("Send user data to API");
                          }).catch(function (response) {
                            console.log(response);
                        });
                      }
                    }).catch(function (response) {
                      console.log(response);
                    });

                  apigClient.cipGet(params,{})
                    .then(function(response) {
                      console.log("Retrieve data from API");
                      let data = response.data.Items[0];
                      callback.cognitoCallbackWithCreds(null, result, creds, data);
                    }).catch(function (response) {
                      console.log(response);
                    });
                  });             
            }
          });
        }
      },
      onFailure: function(err) {
          callback.cognitoCallback(err, null);
      }
    });

  }

  testAccess(data,provider,region,callback){
    let apigClient = apigClientFactory.newClient({
        accessKey: data.accessKey,
        secretKey: data.secretKey,
        sessionToken: data.sessionToken,
        region: region // The region where the API is deployed
    });
  
    if (provider=="google"){
      apigClient.googleGet({},{})
      .then(function(response) {
        console.log(response);
        console.log("Access to /google API Resource with current credentials GRANTED");
        callback.testCallback(response,null);
      }).catch(function (response) {
        console.log(response);
        console.log("Access to /google API Resource with current credentials DENIED");
        callback.testCallback(null,response);
      });
    }
    
    if (provider=="cup"){
      let apigClient = apigClientFactory.newClient();
      let additionalParams = {
        headers: {
          Authorization: data.token
        }
      };
      apigClient.cupGet({},{})
        .then(function(response) {
          console.log(response);
          console.log("Access to /cup API Resource with current credentials GRANTED");
          callback.testCallback(response,null);
        }).catch(function (response) {
          console.log(response);
          console.log("Access to /cup API Resource with current credentials DENIED");
          callback.testCallback(null,response);
        });
    }

    if (provider=="cip"){
      apigClient.cipGet({},{})
        .then(function(response) {
          console.log(response);
          console.log("Access to /cip API Resource with current credentials GRANTED");
          callback.testCallback(response,null);
        }).catch(function (response) {
          console.log(response);
          console.log("Access to /cip API Resource with current credentials DENIED");
          callback.testCallback(null,response);
        });
    }
  }

  private _serverError(err: any) {
        console.log('sever error:', JSON.stringify(err));  // debug
        if(err.status === 0){
            return observableThrowError(err.json().error || 'UNAUTHORIZED!!!');
        }
        if(err instanceof Response) {
          return observableThrowError(err.json().error || 'Backend Server Error');
        }
        // return Observable.throw(err || 'Backend Server Error');
    }

}
