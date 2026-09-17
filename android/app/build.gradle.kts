plugins {
    id("com.android.application")
}

val generatedLynxAssets = layout.buildDirectory.dir("generated/lynxAssets")
val prepareLynxAssets = tasks.register<Sync>("prepareLynxAssets") {
    val bundle = rootProject.layout.projectDirectory.file("../dist/main.lynx.bundle")
    inputs.file(bundle)
    from(bundle)
    into(generatedLynxAssets)
}

android {
    namespace = "com.jonathanperis.speedybird"
    compileSdk = 37
    compileSdkMinor = 2

    sourceSets["main"].assets.directories.apply {
        clear()
        add(generatedLynxAssets.get().asFile.absolutePath)
    }

    defaultConfig {
        applicationId = "com.jonathanperis.speedybird"
        minSdk = 21
        targetSdk = 37
        versionCode = System.getenv("VERSION_CODE")?.toIntOrNull() ?: 1
        versionName = System.getenv("VERSION_NAME") ?: "1.0.0-dev"
    }

    signingConfigs {
        create("release") {
            val ksFile = System.getenv("KEYSTORE_FILE")
            if (!ksFile.isNullOrEmpty()) {
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
            if (!ksFile.isNullOrEmpty()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

}

tasks.named("preBuild") {
    dependsOn(prepareLynxAssets)
}

dependencies {
    // Lynx core
    implementation("org.lynxsdk.lynx:lynx:4.1.0")
    implementation("org.lynxsdk.lynx:lynx-jssdk:4.1.0")
    implementation("org.lynxsdk.lynx:lynx-trace:4.1.0")
    implementation("org.lynxsdk.lynx:primjs:4.1.1")

    // Lynx services
    implementation("org.lynxsdk.lynx:lynx-service-image:4.1.0")
    implementation("org.lynxsdk.lynx:lynx-service-log:4.1.0")
    implementation("org.lynxsdk.lynx:lynx-service-http:4.1.0")

    // Keep the Fresco modules on the same release.
    implementation("com.facebook.fresco:fresco:3.7.0")
    implementation("com.facebook.fresco:animated-gif:3.7.0")
    implementation("com.facebook.fresco:animated-webp:3.7.0")
    implementation("com.facebook.fresco:webpsupport:3.7.0")
    implementation("com.facebook.fresco:animated-base:3.7.0")
    implementation("com.squareup.okhttp3:okhttp:5.5.0")

    // Gson (required by Lynx SDK internals)
    implementation("com.google.code.gson:gson:2.14.0")
}
