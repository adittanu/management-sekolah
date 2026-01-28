import React from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { User, Mail, Calendar, MapPin, Phone, Edit, Shield } from 'lucide-react';
import { PageProps } from '@/types';

// Extend the User type to include potential profile fields if they existed, 
// but for now we'll stick to what we know exists + some visual placeholders
interface UserProfile extends PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            email_verified_at?: string;
            // Add other fields if they become available in the backend
            role?: string;
            avatar?: string;
        }
    }
}

export default function ProfileIndex({ auth }: UserProfile) {
    const { user } = auth;

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <TeacherLayout title="My Profile">
            <Head title="My Profile" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
                    <p className="text-slate-500 mt-2">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Profile Card */}
                    <Card className="md:col-span-1 shadow-md border-slate-200 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <div className="px-6 pb-6 relative">
                            <div className="-mt-12 mb-4 flex justify-center">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt={user.name} />
                                    <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xl">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                                <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mt-1">
                                    <Shield className="h-3 w-3" />
                                    Teacher Account
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                                    <Mail className="h-4 w-4 text-indigo-500" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    <span>Joined {new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Details Section */}
                    <Card className="md:col-span-2 shadow-md border-slate-200">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                View and update your personal details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500">Full Name</label>
                                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-900 font-medium">
                                        {user.name}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500">Email Address</label>
                                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-900 font-medium">
                                        {user.email}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500">Phone Number</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-500 italic">
                                        <Phone className="h-4 w-4" />
                                        <span>Not provided</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500">Address</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-500 italic">
                                        <MapPin className="h-4 w-4" />
                                        <span>Not provided</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="font-medium text-slate-900 mb-4">Account Status</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.email_verified_at 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {user.email_verified_at ? 'Verified' : 'Unverified'}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {user.email_verified_at 
                                            ? `Verified on ${new Date(user.email_verified_at).toLocaleDateString()}` 
                                            : 'Please verify your email address'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3 bg-slate-50/50 p-6 rounded-b-xl">
                            <Button variant="outline">
                                Change Password
                            </Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </TeacherLayout>
    );
}
