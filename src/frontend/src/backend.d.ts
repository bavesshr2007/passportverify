import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PassportApplication {
    id: bigint;
    issueDate: string;
    placeOfBirth: string;
    status: {
        __kind__: "Approved";
        Approved: null;
    } | {
        __kind__: "Rejected";
        Rejected: string;
    } | {
        __kind__: "Pending";
        Pending: null;
    };
    owner: Principal;
    dateOfBirth: string;
    expiryDate: string;
    fullName: string;
    submittedAt: bigint;
    nationality: string;
    address: string;
    gender: string;
    passportNumber: string;
}
export interface ApplicationStats {
    pendingCount: bigint;
    approvedCount: bigint;
    rejectedCount: bigint;
    totalApplications: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveApplication(applicationId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdmin(): Promise<void>;
    getAllApplications(): Promise<Array<PassportApplication>>;
    getApplicationById(applicationId: bigint): Promise<PassportApplication>;
    getApplicationStatus(applicationId: bigint): Promise<PassportApplication>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyApplications(): Promise<Array<PassportApplication>>;
    getMyRole(): Promise<UserRole>;
    getStats(): Promise<ApplicationStats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(user: Principal): Promise<UserRole>;
    isAdminAssigned(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    lookupByPassportNumber(passportNumber: string): Promise<PassportApplication>;
    rejectApplication(applicationId: bigint, reason: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    selfRegister(): Promise<UserRole>;
    submitApplication(fullName: string, dateOfBirth: string, passportNumber: string, nationality: string, issueDate: string, expiryDate: string, placeOfBirth: string, gender: string, address: string): Promise<bigint>;
}
