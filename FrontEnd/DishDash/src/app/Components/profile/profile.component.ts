import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services/user.service';
import { customer } from '../../Model/customer';
import { RouterService } from '../../services/router.service';
import { FileHandle } from '../../Model/file-handle';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  customerJwt: string;
  pictureForm: FormGroup;
  profilePictureUrl: SafeUrl | null = null;
  customerImage: FileHandle;

  activeCustomer: customer = {
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPassword: ''
  };
  constructor(
    private cookieService: CookieService,
    private userService: UserService,
    private routerService: RouterService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {
    this.pictureForm = this.fb.group({
      file: ['']
    });
  }

  onSubmit(): void {
    if (this.pictureForm.invalid) {
      return;
    }

    const imageFormData = this.prepareFormData(this.customerImage);
    this.userService.updateImage( imageFormData,this.cookieService.get('token')).subscribe({
      next: data => {
        console.log('Profile picture uploaded successfully', data);
      },
      error: err => {
        console.log('Error while uploading profile picture', err);
      }
    });
  }

  prepareFormData(customerImage: FileHandle): FormData {
    const formData = new FormData();
    formData.append('image', customerImage.file);
    return formData;
  }

  // triggerFileInput() {
  //   const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  //   fileInput.click();
  // }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileHandle: FileHandle = {
        file: file,
        url: this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file))
      };
      this.customerImage = fileHandle;
      this.pictureForm.patchValue({ file: file });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

    
    // const input = event.target as HTMLInputElement;
    // if (input.files && input.files[0]) {
    //   const file = input.files[0];
    //   const img = new Image();
    //   const reader = new FileReader();

    //   reader.onload = (e: any) => {
    //     img.src = e.target.result;

    //     img.onload = () => {
    //       if (img.width > 100 || img.height > 100) {
    //         alert('Profile photo should have 100 width and 100 height');
    //       } else {
    //         const profileImage = document.getElementById('profileImage') as HTMLImageElement;
    //         profileImage.src = e.target.result;
    //       }
    //     };
    //   };

    //   reader.readAsDataURL(file);
    // }  

  ngOnInit(): void {
    this.customerJwt = this.cookieService.get("token");

    this.userService.fetchCustomerByJwt(this.customerJwt).subscribe({
      next: data => {
        this.activeCustomer = data;
      },
      error: data => {
        console.log("Error while fetching customer");
      }
    });
  }

  logout() {
    this.userService.loggingOutFromProfile(true);
    this.routerService.navigateToHomePage();
  }
}
