"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    clinicName: "", 
    doctorName: "", 
    fullName: "",
    adminPassword: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn.mutateAsync(loginData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp.mutateAsync(registerData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">ClinicOS</h1>
          <p className="text-slate-500">نظام إدارة العيادات الذكي</p>
        </div>

        <Tabs defaultValue="login" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="register">حساب جديد</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">البريد الإلكتروني</Label>
                <Input 
                  id="login-email"
                  type="email" 
                  dir="ltr"
                  className="text-left"
                  placeholder="doctor@clinic.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">كلمة المرور</Label>
                <Input 
                  id="login-password"
                  type="password" 
                  dir="ltr"
                  className="text-left"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>

              <Button className="w-full mt-6" size="lg" type="submit" disabled={signIn.isPending}>
                {signIn.isPending ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">اسم العيادة</Label>
                <Input 
                  id="clinicName"
                  placeholder="عيادة الأمل"
                  value={registerData.clinicName}
                  onChange={(e) => setRegisterData({...registerData, clinicName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorName">اسم الطبيب المعالج</Label>
                <Input 
                  id="doctorName"
                  placeholder="د. أحمد محمود"
                  value={registerData.doctorName}
                  onChange={(e) => setRegisterData({...registerData, doctorName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">اسم المستخدم (المسؤول)</Label>
                <Input 
                  id="fullName"
                  placeholder="الاسم الكامل"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">البريد الإلكتروني</Label>
                <Input 
                  id="reg-email"
                  type="email" 
                  dir="ltr"
                  className="text-left"
                  placeholder="doctor@clinic.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reg-password">كلمة المرور</Label>
                <Input 
                  id="reg-password"
                  type="password" 
                  dir="ltr"
                  className="text-left"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">رمز مرور المسؤول (التحقق من الهوية)</Label>
                <Input 
                  id="admin-password"
                  type="password" 
                  dir="ltr"
                  className="text-left"
                  placeholder="••••••••"
                  value={registerData.adminPassword}
                  onChange={(e) => setRegisterData({...registerData, adminPassword: e.target.value})}
                  required
                />
              </div>

              <Button className="w-full mt-6" size="lg" type="submit" disabled={signUp.isPending}>
                {signUp.isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
