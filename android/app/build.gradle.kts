plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.jonathanperis.speedybird"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.jonathanperis.speedybird"
        minSdk = 21
        targetSdk = 34
        versionCode = System.getenv("VERSION_CODE")?.toIntOrNull() ?: 1
        versionName = System.getenv("VERSION_NAME") ?: "1.0.0-dev"
    }

    signingConfigs {
        create("release") {
            val ksFile = System.getenv("KEYSTORE_FILE")
            if (ksFile != null) {
                storeFile = file(ksFile)
                storePassword = System.getenv("KEYSTORE_PASSWORD")
                keyAlias = System.getenv("KEY_ALIAS")
                keyPassword = System.getenv("KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            val ksFile = System.getenv("KEYSTORE_FILE")
            if (ksFile != null) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }
}

dependencies {
    // Lynx core
    implementation("org.lynxsdk.lynx:lynx:3.7.0")
    implementation("org.lynxsdk.lynx:lynx-jssdk:3.7.0")
    implementation("org.lynxsdk.lynx:lynx-trace:3.7.0")
    implementation("org.lynxsdk.lynx:primjs:3.7.0")

    // Lynx services
    implementation("org.lynxsdk.lynx:lynx-service-image:3.7.0")
    implementation("org.lynxsdk.lynx:lynx-service-log:3.7.0")
    implementation("org.lynxsdk.lynx:lynx-service-http:3.7.0")

    // Image loading (required by lynx-service-image)
    implementation("com.facebook.fresco:fresco:2.3.0")
    implementation("com.facebook.fresco:animated-gif:2.3.0")
    implementation("com.facebook.fresco:animated-webp:2.3.0")
    implementation("com.facebook.fresco:webpsupport:2.3.0")
    implementation("com.facebook.fresco:animated-base:2.3.0")
    implementation("com.squareup.okhttp3:okhttp:4.9.0")

    // Extended elements
    implementation("org.lynxsdk.lynx:xelement:3.7.0")
    implementation("org.lynxsdk.lynx:xelement-input:3.7.0")

    // Gson (required by Lynx SDK internals)
    implementation("com.google.code.gson:gson:2.10.1")
}
