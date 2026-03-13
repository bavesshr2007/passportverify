import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  var nextApplicationId = 1;

  // Passport Application Type
  public type PassportApplication = {
    id : Nat;
    owner : Principal;
    fullName : Text;
    dateOfBirth : Text;
    passportNumber : Text;
    nationality : Text;
    issueDate : Text;
    expiryDate : Text;
    placeOfBirth : Text;
    gender : Text;
    address : Text;
    submittedAt : Int;
    status : {
      #Pending;
      #Approved;
      #Rejected : Text;
    };
  };

  module PassportApplication {
    // Sorting helper to sort applications by ID
    public func compare(a : PassportApplication, b : PassportApplication) : Order.Order {
      Int.compare(a.id, b.id);
    };
  };

  let applications = Map.empty<Nat, PassportApplication>();
  let passportNumberIndex = Map.empty<Text, Nat>();

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Application Statistics
  public type ApplicationStats = {
    totalApplications : Nat;
    pendingCount : Nat;
    approvedCount : Nat;
    rejectedCount : Nat;
  };

  // Authorization State Integration
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  //-----------------------------------
  // Authorization and User Management (Public)
  //-----------------------------------

  public shared ({ caller }) func claimAdmin() : async () {
    // Check if caller is anonymous
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot claim admin");
    };

    // Check if admin already assigned
    if (accessControlState.adminAssigned) {
      Runtime.trap("Admin already assigned");
    };

    // Directly add caller as admin to accessControlState
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
  };

  public shared ({ caller }) func selfRegister() : async AccessControl.UserRole {
    // Check if caller is anonymous
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot register");
    };

    // Check if caller already has a role
    switch (accessControlState.userRoles.get(caller)) {
      case (?role) {
        // Already registered, return existing role
        return role;
      };
      case (null) {
        // Not registered, add as user
        accessControlState.userRoles.add(caller, #user);
        return #user;
      };
    };
  };

  public query ({ caller }) func getUserRole(user : Principal) : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, user);
  };

  public query ({ caller }) func getMyRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public query ({ caller }) func isAdminAssigned() : async Bool {
    accessControlState.adminAssigned;
  };

  //-----------------------------------
  // User Profile Management - Users & Admins Only
  //-----------------------------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  //-------------------------------------
  // Passport Application Management - Users & Admins Only
  //-------------------------------------

  public shared ({ caller }) func submitApplication(
    fullName : Text,
    dateOfBirth : Text,
    passportNumber : Text,
    nationality : Text,
    issueDate : Text,
    expiryDate : Text,
    placeOfBirth : Text,
    gender : Text,
    address : Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users and admins can submit applications");
    };

    let applicationId = nextApplicationId;
    nextApplicationId += 1;

    if (passportNumberIndex.containsKey(passportNumber)) {
      Runtime.trap("Passport number is already in use. Please verify your details.");
    };

    let application : PassportApplication = {
      id = applicationId;
      owner = caller;
      fullName;
      dateOfBirth;
      passportNumber;
      nationality;
      issueDate;
      expiryDate;
      placeOfBirth;
      gender;
      address;
      submittedAt = Time.now();
      status = #Pending;
    };

    applications.add(applicationId, application);
    passportNumberIndex.add(passportNumber, applicationId);
    applicationId;
  };

  public shared ({ caller }) func getApplicationStatus(applicationId : Nat) : async PassportApplication {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users and admins can view application statuses");
    };

    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        // Admins can view any application or users can only view their own applications
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          if (caller != application.owner) {
            Runtime.trap("Unauthorized: Can only view your own applications");
          };
        };
        application;
      };
    };
  };

  public query ({ caller }) func lookupByPassportNumber(passportNumber : Text) : async PassportApplication {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users and admins can lookup applications");
    };

    switch (passportNumberIndex.get(passportNumber)) {
      case (null) { Runtime.trap("No application exists for this passport number.") };
      case (?applicationId) {
        switch (applications.get(applicationId)) {
          case (null) { Runtime.trap("No application exists for this passport number.") };
          case (?application) {
            // Admins can view any application or users can only view their own applications
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              if (caller != application.owner) {
                Runtime.trap("Unauthorized: Can only view your own applications");
              };
            };
            application;
          };
        };
      };
    };
  };

  public query ({ caller }) func getMyApplications() : async [PassportApplication] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users and admins can view their applications");
    };

    let allApplications = applications.values().toArray();
    let filteredApplications = allApplications.filter(
      func(application) {
        application.owner == caller;
      }
    );
    filteredApplications;
  };

  //-----------------------------------
  // Admin Passport Application Functions - Admin only
  //-----------------------------------

  public shared ({ caller }) func approveApplication(applicationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (applications.get(applicationId)) {
      case (null) {
        Runtime.trap("Application does not exist");
      };
      case (?application) {
        let updatedApplication : PassportApplication = {
          application with
          status = #Approved;
        };
        applications.add(applicationId, updatedApplication);
      };
    };
  };

  public shared ({ caller }) func rejectApplication(applicationId : Nat, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (applications.get(applicationId)) {
      case (null) {
        Runtime.trap("Application does not exist");
      };
      case (?application) {
        let updatedApplication : PassportApplication = {
          application with
          status = #Rejected(reason);
        };
        applications.add(applicationId, updatedApplication);
      };
    };
  };

  public query ({ caller }) func getAllApplications() : async [PassportApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    applications.values().toArray().sort();
  };

  public query ({ caller }) func getApplicationById(applicationId : Nat) : async PassportApplication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) { application };
    };
  };

  public query ({ caller }) func getStats() : async ApplicationStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    var pending = 0;
    var approved = 0;
    var rejected = 0;

    for ((_, app) in applications.entries()) {
      switch (app.status) {
        case (#Pending) { pending += 1 };
        case (#Approved) { approved += 1 };
        case (#Rejected(_)) { rejected += 1 };
      };
    };

    {
      totalApplications = applications.size();
      pendingCount = pending;
      approvedCount = approved;
      rejectedCount = rejected;
    };
  };
};
