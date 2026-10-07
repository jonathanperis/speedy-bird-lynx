plugins {
    alias(libs.plugins.android.application)
}

// The APK packages exactly the current build outputs: the Lynx bundle from `bun run build`
// and the canonical sound effects. Nothing is copied into src/, so assets cannot go stale.
val repoRoot = rootProject.layout.projectDirectory.dir("..")
val generatedLynxAssets = layout.buildDirectory.dir("generated/lynxAssets")
val prepareLynxAssets = tasks.register<Sync>("prepareLynxAssets") {
    val bundle = repoRoot.file("dist/main.lynx.bundle")
    val audio = repoRoot.dir("assets/audio")
    inputs.file(bundle)
    inputs.dir(audio)
    from(bundle)
    from(audio) {
        include("*.wav")
        into("audio")
    }
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
            isShrinkResources = true
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

    // Bytecode level for the app's own classes; the build itself runs on JDK 21.
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    androidResources {
        // Sound effects are memory-mapped by SoundPool; keep them uncompressed in the APK.
        noCompress += "wav"
    }
}

tasks.named("preBuild") {
    dependsOn(prepareLynxAssets)
}

dependencies {
    implementation(libs.bundles.lynx)
    // Fresco is pinned to the release Lynx's image service was compiled against.
    implementation(libs.bundles.fresco)
    implementation(libs.androidx.core)
    // Gson (required by Lynx SDK internals)
    implementation(libs.gson)
}
