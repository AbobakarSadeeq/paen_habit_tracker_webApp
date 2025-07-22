import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DropboxService {
  credentionOfDopbox = {
    "AppKey": "lbfmhuj1qgfohiv",
    "AppSecret": "gay39937z42ud12",
    "AccessToken": "sl.u.AF3fYTJqFRelhPNID-Loahk5CpkcbV8Tj2ZIQY_SMSQNNYJs-28Y--gPJ2mQeUdyLNgoyHRDtkcmsSygUSZM_Y9bE9mjh7JGeF1oIPzrn06caWDkYdTJUXCR_xJh1rAsGx0ibUcKyqhnpi7--TJGE0gTuoF-CIT1Ygu7gNWxQWPAoX7YRwoWfEBklBIDAQc5wrp25xmeKCfmZO8e6O3i1Ojq9N36epaj38JbtGlk0F8w7VWGCJvatP98gpfVuZjt_xsORAAQlwL6N7-XKJq2ZcQJ-JotZq6xwiNltSKEW8TtG_gFm-sSrW_ApZIeiAzl5eeeundvIhxncgKJC9q6svZJ1Ye7NgoIWRrZrtLBGjKLfn2YotjNmhQEEHl84Kk49oPbxfkkFUzf1sh1yLF2CPyO0MEc_LPn6No2NMYN84EighoMbZl6QGdtLJhjHvgqDCTPo4SPRCl8A5W2Pu4w5z6XLBR9eSFQfjgxjI539VQe4ec_xAOGV_wu-ComySM_Skn6sD2fEVWyPvmlvKlsTUXh4tNz0fuAcJLS_NBtylxttaHi34NSIzbuwaaLQJy1zkPg0KUPyEpdKegK3KsSrA8UWp_gvUhnpxKAenU94kqN-4MPf_IiAv3K1QMou7tXPQKrQZkj00fmMJJff5UJinga_UwchY4O_xDL_nb15zUMNz2R69F-Pua9N1nJUHKXIfWwguH7xe9wuu_dgKZCbB3IUZxN7UiXSCYgKYVlHXGMhPdh12vMPI2150gm8Xd6D4LoRYZ6naCj8929wTQWRDOJ4mVURbAIJCblue_Sf-xQo4flm5Iz8N898Gv890GXApH35aZOQ0aA1SOS3ljGMMSZ5dSUVoTxCOxuBb-ZQYS_yQNPHAQq2xrPhGdYAisJqYP5o8HcVTVwoL2RoRO7ZJCfNEByHGxMw4FXJYivr0NPrbOH34zdY8Veuc6ghd3U5TqY_Xtb3vWbG1-18HLomvbYfXQMwFeMxtjuF7YNZ7_1KcTyDBVzpLLT-D8xihHWRK6pUlseeQTcQso31daev1GORVqdknEeqtDI2QxCWcp8HCYD9OFmAceTHqitJW-UUHuCjXmXulHAKnyPFrU_cZntoy3vCQfV26tQfLPhDh_N1VEj-4X3Re5AT6bFLT20QExQy43w-HOMlnrVJjx24nfmjA_qDSIiSOFt_sxpHBKoUZzuSBqlt5aeJ0cl8T6p7w1QOHNNJF6TrdVJRPYTwkP1EpBoKGRNTpDxMT0_JxQRwRJAXuicbXTm4QUyek2LFPsEatlyyTPTHvFab965vMND",
    "redirectUri": "http://localhost:4200",
    "responseType": "code"
  }

  constructor(private _http: HttpClient) { }



  abcRequest() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.credentionOfDopbox.AccessToken}`
    });
    return this._http.post('https://api.dropboxapi.com/2/users/get_current_account', null, { headers });
  }

  // createFolderOnDropbox() {
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${this.credentionOfDopbox.AccessToken}`,
  //     "Content-Type": "application/json"
  //   });
  //   const data = {
  //     "autorename": false,
  //     "path": "/qwertyu"
  //   }
  //   return this._http.post('https://api.dropboxapi.com/2/files/create_folder_v2', data, { headers });
  // }

  loginDropbox() {
    const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
      `client_id=${this.credentionOfDopbox.AppKey}&` +
      `redirect_uri=${encodeURIComponent(this.credentionOfDopbox.redirectUri)}&` +
      `response_type=code`;

    // Use window.location.href instead of HTTP request
    window.location.href = authUrl;


    // --------------------- use this below api only for logIn for first time in your app and it will also get the access and refresh token but access token will be there for only 10 mints and not good for new access token --------------------
    //  curl https://api.dropbox.com/oauth2/token \
    //  -d code=<AUTHORIZATION_CODE> \    ← This code expires in ~10 minutes
    //  -d grant_type=authorization_code \
    //  -d redirect_uri=<REDIRECT_URI> \
    //  -d client_id=<APP_KEY> \
    //  -d client_secret=<APP_SECRET>

  }

  logoutDropbox() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.credentionOfDopbox.AccessToken}`,
    });

    return this._http.post('https://api.dropboxapi.com/2/auth/token/revoke', {}, { headers });
  }
}
